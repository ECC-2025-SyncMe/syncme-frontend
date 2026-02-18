import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

// 레이아웃 스타일 불러오기
import { Container, Column } from './FriendsStyles';

// 하위 컴포넌트 불러오기
import UserProfile from '../components/friends/UserProfile';
import FriendList from '../components/friends/FriendList';
import GuestWall from '../components/friends/GuestWall';

export default function Friends() {
    const location = useLocation(); // 페이지 이동 감지
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

    // 초기 데이터 로드 (페이지 진입 시 무조건 실행)
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // 모든 데이터를 병렬로
                const [userRes, statusRes, followingRes, followerRes, commentsRes] = await Promise.all([
                    api.get('/users/me'),
                    api.get('/status/today'),
                    api.get('/friends/following'),
                    api.get('/friends/followers'),
                    api.get('/comments/received')
                ]);

                // 내 정보 + 상태 + 댓글 병합
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

                // 팔로잉 / 팔로워 리스트 세팅 (디버깅 로그 포함)
                // console.log("내 팔로잉 원본:", followingRes.data.data);
                // console.log("내 팔로워 원본:", followerRes.data.data);

                // (닉네임이 없어도 '이름 없음'으로라도 뜨게 해서 데이터 존재 여부 확인)
                const isValidUser = (user) => user && user.userId;

                if (followingRes.data.success && Array.isArray(followingRes.data.data)) {
                    const validFollowing = followingRes.data.data.filter(isValidUser);
                    setFollowingList(validFollowing);
                }

                if (followerRes.data.success && Array.isArray(followerRes.data.data)) {
                    const validFollowers = followerRes.data.data.filter(isValidUser);
                    setFollowerList(validFollowers);
                }

            } catch (error) {
                console.error("초기 데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [location.key]); // URL이 변경되거나 페이지에 다시 들어올 때 실행

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
                    // 검색 결과에서 '나'는 제외
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
            // 현재 리스트에서 팔로우 여부 확인
            const isAlreadyFollowing = followingList.some(f => f.userId === friendId);

            if (isAlreadyFollowing) {
                // 언팔로우: UI 선반영 (즉시 제거)
                setFollowingList(prev => prev.filter(f => f.userId !== friendId));
                await api.delete(`/friends/${friendId}`);
            } else {
                // 팔로우: UI 선반영 (즉시 추가)
                // 검색 결과나 팔로워 목록에서 해당 유저 정보를 찾음
                const targetUser = searchResults.find(u => u.userId === friendId)
                    || followerList.find(u => u.userId === friendId);

                // 정보가 없으면 임시 객체 생성
                const newFriend = targetUser || { userId: friendId, nickname: '알 수 없음', email: '' };

                setFollowingList(prev => [...prev, newFriend]);
                await api.post(`/friends/${friendId}`);
            }
        } catch (error) {
            console.error("팔로우 처리 실패:", error);
            // 에러 발생 시 서버 데이터로 원복 (동기화)
            const syncRes = await api.get('/friends/following');
            if (syncRes.data.success) setFollowingList(syncRes.data.data);
        }
    };

    // 화면에 보여줄 리스트 결정 함수
    const getDisplayList = () => {
        // 검색 중일 때
        if (keyword.trim()) {
            return searchResults.map(user => ({
                ...user,
                isFollowing: followingList.some(f => f.userId === user.userId)
            }));
        }

        // 팔로잉 탭
        if (activeTab === 'following') {
            return followingList.map(user => ({
                ...user,
                isFollowing: true
            }));
        }
        // 3. 팔로워 탭
        else {
            return followerList.map(user => ({
                ...user,
                // 팔로워가 내 팔로잉 목록에도 있는지 확인 (맞팔 여부 확인용)
                isFollowing: followingList.some(f => f.userId === user.userId)
            }));
        }
    };

    // 타겟 설정 (우측 담벼락용)
    const wallUser = target || myProfile;
    const isMe = target === null;

    // 친구 선택 핸들러 (상세 정보 로드)
    const handleSelectFriend = async (friend) => {
        try {
            const [homeRes, commentsRes] = await Promise.all([
                api.get(`/home/${friend.userId}`),
                api.get(`/friends/${friend.userId}/comments`)
            ]);

            let finalFriendData = { ...friend };

            // 홈 정보(상태 메시지, 캐릭터 등) 병합
            if (homeRes.data.success) {
                finalFriendData = { ...finalFriendData, ...homeRes.data.data };
            }

            // 댓글 병합
            if (commentsRes.data.success) {
                finalFriendData.comments = commentsRes.data.data;
            } else {
                finalFriendData.comments = [];
            }

            setTarget(finalFriendData);

        } catch (error) {
            console.error("친구 상세 정보 로드 실패:", error);
            // 에러 나도 기본 정보로 보여줌
            setTarget({ ...friend, comments: [] });
        }
    };

    // 댓글(방명록) 작성 핸들러
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
                데이터 불러오는 중...
            </div>
        );
    }

    return (
        <Container>
            {/* 왼쪽: 내 프로필 또는 선택한 친구 프로필 */}
            <Column className="left">
                <UserProfile
                    myInfo={target || myProfile} // target이 있으면 친구 정보, 없으면 내 정보 표시
                    isMe={target === null}       // target이 없어야 '나'
                    showBack={target !== null}   // 친구 보고 있을 때만 뒤로가기 표시
                    onResetTarget={() => setTarget(null)}
                />
            </Column>

            {/* 가운데: 리스트 (팔로잉/팔로워/검색) */}
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

            {/* 오른쪽: 담벼락 (방명록) */}
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