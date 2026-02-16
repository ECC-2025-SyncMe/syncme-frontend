import React, { useState, useEffect } from 'react';
import api from '../api/axios';

// 레이아웃 스타일 불러오기
import { Container, Column } from './FriendsStyles';

// 하위 컴포넌트 불러오기
import UserProfile from '../components/friends/UserProfile';
import FriendList from '../components/friends/FriendList';
import GuestWall from '../components/friends/GuestWall';

export default function Friends() {
    const [myProfile, setMyProfile] = useState(null);

    // 친구 목록 상태
    const [followingList, setFollowingList] = useState([]);
    const [followerList, setFollowerList] = useState([]);

    // 검색 결과 상태
    const [searchResults, setSearchResults] = useState([]);

    const [target, setTarget] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [activeTab, setActiveTab] = useState('following');
    const [loading, setLoading] = useState(true);

    // 초기 데이터 로드
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [userRes, followingRes, followerRes, commentsRes] = await Promise.all([
                    api.get('/users/me'),
                    api.get('/friends/following'),
                    api.get('/friends/followers'),
                    api.get('/comments/received') // 내가 받은 댓글 조회
                ]);

                let userData = null;

                // 내 정보 세팅
                if (userRes.data.success) {
                    userData = userRes.data.data;
                }

                // 댓글 데이터가 있으면 내 정보에 'comments' 필드로 병합
                if (commentsRes.data.success && userData) {
                    userData.comments = commentsRes.data.data;
                }

                // 병합된 데이터를 상태에 저장
                if (userData) {
                    setMyProfile(userData);
                }

                // 팔로잉/팔로워 리스트 세팅
                if (followingRes.data.success && Array.isArray(followingRes.data.data)) {
                    setFollowingList(followingRes.data.data);
                }
                if (followerRes.data.success && Array.isArray(followerRes.data.data)) {
                    setFollowerList(followerRes.data.data);
                }

            } catch (error) {
                console.error("초기 데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // 검색 기능
    useEffect(() => {
        const searchUsers = async () => {
            if (!keyword.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                const res = await api.get(`/users/search?query=${keyword}&type=nickname`);
                if (res.data.success && Array.isArray(res.data.data)) {
                    // 검색 결과에서 '나'는 제외하고 저장
                    const filtered = res.data.data.filter(u => u.userId !== myProfile?.userId);
                    setSearchResults(filtered);
                }
            } catch (error) {
                console.error("검색 실패:", error);
            }
        };

        const timer = setTimeout(() => {
            searchUsers();
        }, 500);

        return () => clearTimeout(timer);
    }, [keyword, myProfile]);


    // 팔로우 / 언팔로우 핸들러
    const handleFollow = async (friendId) => {
        if (myProfile?.userId === friendId) {
            alert("자기 자신은 팔로우할 수 없습니다.");
            return;
        }

        try {
            const isAlreadyFollowing = followingList.some(f => f?.userId === friendId);

            if (isAlreadyFollowing) {
                // 언팔로우: UI 선반영
                setFollowingList(prev => prev.filter(f => f?.userId !== friendId));
                await api.delete(`/friends/${friendId}`);
            } else {
                // 팔로우: UI 선반영
                const targetUser = searchResults.find(u => u.userId === friendId)
                    || followerList.find(u => u.userId === friendId);
                const newFriend = targetUser || { userId: friendId, nickname: 'Unknown' };

                setFollowingList(prev => [...prev, newFriend]);
                await api.post(`/friends/${friendId}`);
            }
        } catch (error) {
            console.error("팔로우 처리 실패:", error);
            const syncRes = await api.get('/friends/following');
            if (syncRes.data.success) setFollowingList(syncRes.data.data);
        }
    };

    // 화면에 보여줄 리스트 결정 함수
    const getDisplayList = () => {
        if (keyword.trim()) {
            return searchResults.map(user => ({
                ...user,
                isFollowing: followingList.some(f => f?.userId === user.userId)
            }));
        }

        if (activeTab === 'following') {
            return followingList.filter(f => f != null).map(user => ({ ...user, isFollowing: true }));
        } else {
            return followerList.filter(f => f != null).map(user => ({
                ...user,
                isFollowing: followingList.some(f => f?.userId === user.userId)
            }));
        }
    };

    // 타겟 설정(내 프로필 or 친구 프로필)
    const wallUser = target || myProfile;
    const isMe = target === null;

    // 친구 선택 핸들러(친구 정보 + 친구 댓글 가져오기)
    const handleSelectFriend = async (friend) => {
        try {
            // 친구 홈 정보 조회, 친구 댓글 조회
            const [homeRes, commentsRes] = await Promise.all([
                api.get(`/home/${friend.userId}`),
                api.get(`/friends/${friend.userId}/comments`)
            ]);

            let finalFriendData = { ...friend };

            // 홈 정보 병합
            if (homeRes.data.success) {
                finalFriendData = { ...finalFriendData, ...homeRes.data.data };
            }

            // 댓글 정보 병합
            if (commentsRes.data.success) {
                finalFriendData.comments = commentsRes.data.data;
            } else {
                finalFriendData.comments = [];
            }

            setTarget(finalFriendData);

        } catch (error) {
            console.error("친구 상세 정보 로드 실패:", error);
            setTarget({ ...friend, comments: [] });
        }
    };

    // 댓글 작성 핸들러
    const handleSaveComment = async (text) => {
        if (isMe || !target) {
            alert("내 담벼락에는 글을 쓸 수 없습니다.");
            return;
        }

        try {
            // 친구에게 댓글 작성 POST
            const res = await api.post(`/friends/${target.userId}/comments`, {
                content: text
            });

            if (res.data.success) {
                const newComment = res.data.data;
                setTarget(prev => ({
                    ...prev,
                    comments: [...(prev.comments || []), newComment]
                }));
            }
        } catch (error) {
            console.error("방명록 저장 실패:", error);
            alert("방명록을 저장하지 못했습니다.");
        }
    };

    if (loading || !myProfile) return <div>로딩 중...</div>;

    return (
        <Container>
            <Column className="left">
                <UserProfile
                    myInfo={myProfile}
                    isMe={true}
                    showBack={target !== null}
                    onResetTarget={() => setTarget(null)}
                />
            </Column>

            <Column className="center">
                <FriendList
                    keyword={keyword}
                    setKeyword={setKeyword}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    getDisplayList={getDisplayList}
                    handleFollow={handleFollow}
                    setTarget={handleSelectFriend}
                    followingCount={followingList.length}
                    followerCount={followerList.length}
                />
            </Column>

            <Column className="right">
                <GuestWall
                    wallUser={wallUser}
                    isMe={isMe}
                    onSaveComment={handleSaveComment}
                />
            </Column>
        </Container>
    );
}