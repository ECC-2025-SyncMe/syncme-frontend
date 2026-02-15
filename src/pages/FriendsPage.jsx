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

                // [안전장치] 데이터가 배열인지 확인하고 설정
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

    // 2. 검색 기능
    useEffect(() => {
        const searchUsers = async () => {
            if (!keyword.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                const res = await api.get(`/users/search?query=${keyword}&type=nickname`);
                if (res.data.success) {
                    setSearchResults(res.data.data);
                }
            } catch (error) {
                console.error("검색 실패:", error);
            }
        };

        const timer = setTimeout(() => {
            searchUsers();
        }, 500);

        return () => clearTimeout(timer);
    }, [keyword]);


    // 3. 팔로우 / 언팔로우 핸들러 [수정됨: 에러 원인 해결]
    const handleFollow = async (friendId) => {
        try {
            // [핵심 수정] f?.userId 로 변경하여 f가 null일 경우 에러 방지
            const isAlreadyFollowing = followingList.some(f => f?.userId === friendId);

            if (isAlreadyFollowing) {
                // 언팔로우
                await api.delete(`/friends/${friendId}`);
                setFollowingList(prev => prev.filter(f => f?.userId !== friendId));
                alert("언팔로우 했습니다.");
            } else {
                // 팔로우
                const res = await api.post(`/friends/${friendId}`);
                if (res.data.success) {
                    const newFriend = res.data.data;
                    setFollowingList(prev => [...prev, newFriend]);
                    alert("팔로우 했습니다!");
                }
            }
        } catch (error) {
            console.error("팔로우 처리 실패:", error);
            // 에러 상황을 알림
            alert(error.response?.data?.message || "처리 중 오류가 발생했습니다.");
        }
    };

    // 화면에 보여줄 리스트 결정 함수 [수정됨: 에러 원인 해결]
    const getDisplayList = () => {
        if (keyword.trim()) {
            return searchResults.map(user => ({
                ...user,
                // [핵심 수정] f?.userId 로 안전하게 접근
                isFollowing: followingList.some(f => f?.userId === user.userId)
            }));
        }

        if (activeTab === 'following') {
            // null인 항목 제외하고(filter) 매핑
            return followingList.filter(f => f != null).map(user => ({ ...user, isFollowing: true }));
        } else {
            return followerList.filter(f => f != null).map(user => ({
                ...user,
                // [핵심 수정] f?.userId
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