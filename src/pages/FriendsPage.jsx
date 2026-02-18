import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

import { Container, Column } from './FriendsStyles';

import UserProfile from '../components/friends/UserProfile';
import FriendList from '../components/friends/FriendList';
import GuestWall from '../components/friends/GuestWall';

export default function Friends() {
    const location = useLocation();

    // 내 정보 (왼쪽 고정용)
    const [myProfile, setMyProfile] = useState(null);

    // 친구 리스트 관련 state
    const [followingList, setFollowingList] = useState([]);
    const [followerList, setFollowerList] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    // UI 상태
    const [target, setTarget] = useState(null); // 현재 선택된 친구 (담벼락용)
    const [keyword, setKeyword] = useState('');
    const [activeTab, setActiveTab] = useState('following');
    const [loading, setLoading] = useState(true);

    // 초기 데이터 로드 (내 정보 + 친구 목록)
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // 내 정보, 내 오늘 상태, 팔로잉, 팔로워, 내 방명록 동시 호출
                const [userRes, statusRes, followingRes, followerRes, commentsRes] = await Promise.all([
                    api.get('/users/me'),
                    api.get('/status/today'),
                    api.get('/friends/following'),
                    api.get('/friends/followers'),
                    api.get('/comments/received')
                ]);

                // 내 프로필 데이터 구성 (User + Status + Comments)
                let userData = null;
                if (userRes.data.success) {
                    userData = userRes.data.data;
                }
                if (statusRes.data.success && userData) {
                    userData.status = statusRes.data.data; // 요약(Summary) 계산을 위해 필요
                }
                if (commentsRes.data.success && userData) {
                    userData.comments = commentsRes.data.data;
                }

                if (userData) {
                    setMyProfile(userData);
                }

                // 친구 목록 세팅 (유효성 검사 포함)
                const isValidUser = (user) => user && user.userId;
                if (followingRes.data.success && Array.isArray(followingRes.data.data)) {
                    setFollowingList(followingRes.data.data.filter(isValidUser));
                }
                if (followerRes.data.success && Array.isArray(followerRes.data.data)) {
                    setFollowerList(followerRes.data.data.filter(isValidUser));
                }

            } catch (error) {
                console.error("초기 데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [location.key]);

    // 검색 기능 (Debounce 적용)
    useEffect(() => {
        const searchUsers = async () => {
            if (!keyword.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                const res = await api.get(`/users/search?query=${keyword}&type=nickname`);
                if (res.data.success && Array.isArray(res.data.data)) {
                    // 나 자신은 검색 결과에서 제외
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

    // 팔로우/언팔로우 핸들러
    const handleFollow = async (friendId) => {
        if (myProfile?.userId === friendId) {
            alert("자기 자신은 팔로우할 수 없습니다.");
            return;
        }
        try {
            const isAlreadyFollowing = followingList.some(f => f.userId === friendId);

            if (isAlreadyFollowing) {
                setFollowingList(prev => prev.filter(f => f.userId !== friendId));
                await api.delete(`/friends/${friendId}`);
            } else {
                const targetUser = searchResults.find(u => u.userId === friendId) || followerList.find(u => u.userId === friendId);
                const newFriend = targetUser || { userId: friendId, nickname: '알 수 없음', email: '' };
                setFollowingList(prev => [...prev, newFriend]);
                await api.post(`/friends/${friendId}`);
            }
        } catch (error) {
            console.error("팔로우 처리 실패:", error);
            // 실패 시 목록 롤백 (재조회)
            const syncRes = await api.get('/friends/following');
            if (syncRes.data.success) setFollowingList(syncRes.data.data);
        }
    };

    // 리스트 필터링 (검색어 or 탭 기준)
    const getDisplayList = () => {
        if (keyword.trim()) {
            return searchResults.map(user => ({
                ...user,
                isFollowing: followingList.some(f => f.userId === user.userId)
            }));
        }
        if (activeTab === 'following') {
            return followingList.map(user => ({ ...user, isFollowing: true }));
        } else {
            return followerList.map(user => ({
                ...user,
                isFollowing: followingList.some(f => f.userId === user.userId)
            }));
        }
    };

    // 친구 선택 핸들러 (오른쪽 담벼락 변경용)
    const handleSelectFriend = async (friend) => {
        try {
            const [homeRes, commentsRes] = await Promise.all([
                api.get(`/home/${friend.userId}`),
                api.get(`/friends/${friend.userId}/comments`)
            ]);

            let finalFriendData = { ...friend };

            // 친구의 홈 정보 병합
            if (homeRes.data.success) {
                finalFriendData = { ...finalFriendData, ...homeRes.data.data };
            }
            // 친구의 방명록 병합
            if (commentsRes.data.success) {
                finalFriendData.comments = commentsRes.data.data;
            } else {
                finalFriendData.comments = [];
            }

            setTarget(finalFriendData); // 타겟 설정 -> 오른쪽 담벼락 갱신
        } catch (error) {
            console.error("친구 상세 정보 로드 실패:", error);
            // 실패해도 기본 정보로 타겟 설정은 시도
            setTarget({ ...friend, comments: [] });
        }
    };

    // 방명록 저장 핸들러
    const handleSaveComment = async (text) => {
        // 내 담벼락이거나 타겟이 없으면 작성 불가
        if (!target) {
            alert("내 담벼락에는 글을 쓸 수 없습니다.");
            return;
        }
        try {
            const res = await api.post(`/friends/${target.userId}/comments`, { content: text });
            if (res.data.success) {
                setTarget(prev => ({
                    ...prev,
                    comments: [...(prev.comments || []), res.data.data]
                }));
            }
        } catch (error) {
            console.error("방명록 저장 실패:", error);
            alert("방명록을 저장하지 못했습니다.");
        }
    };

    if (loading || !myProfile) {
        return <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', background: '#000' }}>데이터 불러오는 중...</div>;
    }

    // 현재 오른쪽 담벼락의 주인 (target이 없으면 내 것)
    const wallUser = target || myProfile;
    const isMeWall = target === null;

    return (
        <Container>
            {/* 왼쪽: 프로필 영역 (항상 내 정보 고정) 
               - myInfo: myProfile (내 정보)
               - isMe: true (내 캐릭터/요약 표시)
               - showBack: target이 있을 때만 true (뒤로가기 버튼)
            */}
            <Column className="left">
                <UserProfile
                    myInfo={myProfile}
                    isMe={true}
                    showBack={target !== null}
                    onResetTarget={() => setTarget(null)}
                />
            </Column>

            {/* 가운데: 친구 리스트 */}
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

            {/* 오른쪽: 담벼락 (친구 선택 시 친구 것, 아니면 내 것) */}
            <Column className="right">
                <GuestWall
                    wallUser={wallUser}
                    isMe={isMeWall}
                    onSaveComment={handleSaveComment}
                />
            </Column>
        </Container>
    );
}