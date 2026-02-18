import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // 페이지 이동 감지용 import
import api from '../api/axios';

// 레이아웃 스타일 불러오기
import { Container, Column } from './FriendsStyles';

// 하위 컴포넌트 불러오기
import UserProfile from '../components/friends/UserProfile';
import FriendList from '../components/friends/FriendList';
import GuestWall from '../components/friends/GuestWall';

export default function Friends() {
    const location = useLocation(); // 위치 정보 훅 사용
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

    // 초기 데이터 로드(페이지 진입 시마다 실행)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [userRes, statusRes, followingRes, followerRes, commentsRes] = await Promise.all([
                    api.get('/users/me'),
                    api.get('/status/today'),
                    api.get('/friends/following'),
                    api.get('/friends/followers'),
                    api.get('/comments/received')
                ]);

                let userData = null;
                if (userRes.data.success) {
                    userData = userRes.data.data;
                }

                if (statusRes.data.success && userData) {
                    userData.status = statusRes.data.data;
                }

                if (commentsRes.data.success && userData) {
                    userData.comments = commentsRes.data.data;
                }

                if (userData) {
                    setMyProfile(userData);
                }

                // 탈퇴한 유저 필터링
                // 서버 응답 구조에 따라 f.userId 혹은 f 자체가 null인지 확인
                if (followingRes.data.success && Array.isArray(followingRes.data.data)) {
                    const validFollowing = followingRes.data.data.filter(f => f && f.userId);
                    setFollowingList(validFollowing);
                }

                if (followerRes.data.success && Array.isArray(followerRes.data.data)) {
                    const validFollowers = followerRes.data.data.filter(f => f && f.userId);
                    setFollowerList(validFollowers);
                }

            } catch (error) {
                console.error("초기 데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [location.key]);

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
                setFollowingList(prev => prev.filter(f => f?.userId !== friendId));
                await api.delete(`/friends/${friendId}`);
            } else {
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
            // f가 null이 아닌지 한 번 더 체크
            return followingList.filter(f => f && f.userId).map(user => ({ ...user, isFollowing: true }));
        } else {
            return followerList.filter(f => f && f.userId).map(user => ({
                ...user,
                isFollowing: followingList.some(f => f?.userId === user.userId)
            }));
        }
    };

    // 타겟 설정
    const wallUser = target || myProfile;
    const isMe = target === null;

    // 친구 선택 핸들러
    const handleSelectFriend = async (friend) => {
        try {
            const [homeRes, commentsRes] = await Promise.all([
                api.get(`/home/${friend.userId}`),
                api.get(`/friends/${friend.userId}/comments`)
            ]);

            let finalFriendData = { ...friend };

            if (homeRes.data.success) {
                finalFriendData = { ...finalFriendData, ...homeRes.data.data };
            }

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

    if (loading || !myProfile) {
        return (
            <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', background: '#000' }}>
                로딩 중...
            </div>
        );
    }

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