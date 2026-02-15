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

    // 친구 목록 상태 (팔로잉 / 팔로워)
    const [followingList, setFollowingList] = useState([]);
    const [followerList, setFollowerList] = useState([]);

    // 검색 결과 상태
    const [searchResults, setSearchResults] = useState([]);

    const [target, setTarget] = useState(null); // 우측 패널에 띄울 유저
    const [keyword, setKeyword] = useState('');
    const [activeTab, setActiveTab] = useState('following'); // 'following' | 'followers'
    const [loading, setLoading] = useState(true);

    // 초기 데이터 로드 (내 정보 + 팔로잉 + 팔로워)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [userRes, followingRes, followerRes] = await Promise.all([
                    api.get('/users/me'),
                    api.get('/friends/following'), // 내가 팔로우한 사람
                    api.get('/friends/followers')  // 나를 팔로우한 사람
                ]);

                if (userRes.data.success) setMyProfile(userRes.data.data);
                if (followingRes.data.success) setFollowingList(followingRes.data.data);
                if (followerRes.data.success) setFollowerList(followerRes.data.data);

            } catch (error) {
                console.error("초기 데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // 검색 기능 (키워드가 바뀔 때마다 API 호출)
    useEffect(() => {
        const searchUsers = async () => {
            if (!keyword.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                // 검색 API 호출 (query=검색어&type=nickname)
                const res = await api.get(`/users/search?query=${keyword}&type=nickname`);
                if (res.data.success) {
                    setSearchResults(res.data.data);
                }
            } catch (error) {
                console.error("검색 실패:", error);
            }
        };

        // 타이핑 멈추면 0.5초 뒤 검색 (디바운싱 효과)
        const timer = setTimeout(() => {
            searchUsers();
        }, 500);

        return () => clearTimeout(timer);
    }, [keyword]);


    // 팔로우 / 언팔로우 핸들러
    const handleFollow = async (friendId) => {
        try {
            // 이미 팔로우 중인지 확인 (followingList에 있는지)
            const isAlreadyFollowing = followingList.some(f => f.userId === friendId);

            if (isAlreadyFollowing) {
                // 언팔로우
                await api.delete(`/friends/${friendId}`);
                // 목록 업데이트
                setFollowingList(prev => prev.filter(f => f.userId !== friendId));
                alert("언팔로우 했습니다.");
            } else {
                // 팔로우
                const res = await api.post(`/friends/${friendId}`);
                if (res.data.success) {
                    // API 응답값(새 친구 정보)을 리스트에 추가
                    // 만약 응답에 user info가 없다면 다시 fetch 해야 함. 
                    // 여기선 res.data.data가 팔로우된 유저 정보라고 가정.
                    const newFriend = res.data.data;
                    setFollowingList(prev => [...prev, newFriend]);
                    alert("팔로우 했습니다!");
                }
            }
        } catch (error) {
            console.error("팔로우 처리 실패:", error);
            alert("처리 중 오류가 발생했습니다.");
        }
    };

    // 화면에 보여줄 리스트 결정 함수
    const getDisplayList = () => {
        // 검색어가 있으면 검색 결과 반환
        if (keyword.trim()) {
            return searchResults.map(user => ({
                ...user,
                // 검색 결과에 'isFollowing' 속성을 추가해서 버튼 모양 결정
                isFollowing: followingList.some(f => f.userId === user.userId)
            }));
        }

        // 검색어가 없으면 탭에 따라 반환
        if (activeTab === 'following') {
            return followingList.map(user => ({ ...user, isFollowing: true }));
        } else {
            // 팔로워 목록 (내가 맞팔했는지 체크)
            return followerList.map(user => ({
                ...user,
                isFollowing: followingList.some(f => f.userId === user.userId)
            }));
        }
    };

    if (loading || !myProfile) return <div>로딩 중...</div>;

    const wallUser = target || myProfile;
    const isMe = target === null;

    // 방명록 저장 (임시 UI)
    const handleSaveComment = (text) => {
        const newComm = { id: Date.now(), writer: myProfile.nickname, text: text };
        if (isMe) {
            alert("내 담벼락에는 글을 쓸 수 없습니다.");
        } else {
            // 실제로는 api.post(...) 필요
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
                    // Props 전달 수정
                    keyword={keyword}
                    setKeyword={setKeyword}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    getDisplayList={getDisplayList}
                    handleFollow={handleFollow}
                    setTarget={setTarget}
                    // 탭에 숫자 표시용
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