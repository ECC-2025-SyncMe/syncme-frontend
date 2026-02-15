import React, { useState, useEffect } from 'react';
import api from '../api/axios';

// 레이아웃 스타일 불러오기
import { Container, Column } from './FriendsStyles';

// 하위 컴포넌트 불러오기
import UserProfile from '../components/friends/UserProfile';
import FriendList from '../components/friends/FriendList';
import GuestBook from '../components/friends/GuestBook';

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

    // 1. 초기 데이터 로드
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [userRes, followingRes, followerRes] = await Promise.all([
                    api.get('/users/me'),
                    api.get('/friends/following'),
                    api.get('/friends/followers')
                ]);

                if (userRes.data.success) setMyProfile(userRes.data.data);

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

    // 2. 검색 기능 (본인 제외 로직 추가)
    useEffect(() => {
        const searchUsers = async () => {
            if (!keyword.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                const res = await api.get(`/users/search?query=${keyword}&type=nickname`);
                if (res.data.success && Array.isArray(res.data.data)) {
                    // [수정] 검색 결과에서 '나'는 제외하고 저장
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
    }, [keyword, myProfile]); // myProfile이 로드된 후 필터링 적용


    // 3. 팔로우 / 언팔로우 핸들러 (UI 즉시 반영 로직 강화)
    const handleFollow = async (friendId) => {
        if (myProfile?.userId === friendId) {
            alert("자기 자신은 팔로우할 수 없습니다.");
            return;
        }

        try {
            // 현재 리스트에 있는지 확인
            const isAlreadyFollowing = followingList.some(f => f?.userId === friendId);

            if (isAlreadyFollowing) {
                // [언팔로우 로직]
                // 1. UI 먼저 업데이트 (낙관적 업데이트: 사용자 경험 향상)
                setFollowingList(prev => prev.filter(f => f?.userId !== friendId));

                // 2. API 요청
                await api.delete(`/friends/${friendId}`);
            } else {
                // [팔로우 로직]
                // 검색 결과나 팔로워 목록에서 해당 유저의 전체 정보를 찾음
                const targetUser = searchResults.find(u => u.userId === friendId)
                    || followerList.find(u => u.userId === friendId);

                // 정보가 없으면 최소한의 ID라도 만듦
                const newFriend = targetUser || { userId: friendId, nickname: 'Unknown' };

                // 1. UI 먼저 업데이트 (즉시 체크 표시 됨)
                setFollowingList(prev => [...prev, newFriend]);

                // 2. API 요청
                await api.post(`/friends/${friendId}`);
            }

        } catch (error) {
            console.error("팔로우 처리 실패:", error);

            // 실패 시 롤백(되돌리기)을 위해 목록을 다시 불러오는 것이 가장 안전
            // 에러 메시지 띄우고 새로고침 유도 or 조용히 재조회
            if (error.response?.status === 400) {
                const msg = error.response.data?.message || "";
                if (msg.includes("already")) {
                    alert("이미 팔로우 된 상태입니다.");
                }
            }

            // 에러가 나면 데이터 꼬임을 방지하기 위해 서버 데이터로 다시 동기화 추천
            const syncRes = await api.get('/friends/following');
            if (syncRes.data.success) setFollowingList(syncRes.data.data);
        }
    };

    // 화면에 보여줄 리스트 결정 함수
    const getDisplayList = () => {
        if (keyword.trim()) {
            return searchResults.map(user => ({
                ...user,
                // followingList에 내 userId가 있는지 확인하여 true/false 결정
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

    if (loading || !myProfile) return <div>로딩 중...</div>;

    const wallUser = target || myProfile;
    const isMe = target === null;

    const handleSaveComment = (text) => {
        const newComm = { id: Date.now(), writer: myProfile.nickname, text: text };
        if (isMe) {
            alert("내 담벼락에는 글을 쓸 수 없습니다.");
        } else {
            setTarget(prev => ({
                ...prev,
                comments: [...(prev.comments || []), newComm]
            }));
        }
    };

    return (
        <Container>
            <Column className="left">
                <UserProfile
                    myInfo={myProfile}
                    isMe={isMe}
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
                    setTarget={setTarget}
                    followingCount={followingList.length}
                    followerCount={followerList.length}
                />
            </Column>

            <Column className="right">
                <GuestBook
                    wallUser={wallUser}
                    isMe={isMe}
                    onSaveComment={handleSaveComment}
                />
            </Column>
        </Container>
    );
}