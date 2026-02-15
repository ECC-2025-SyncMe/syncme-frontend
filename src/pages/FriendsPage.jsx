import React, { useState, useEffect } from 'react';
import api from '../api/axios';

// 레이아웃 스타일 불러오기
import { Container, Column } from './FriendsStyles';

// 하위 컴포넌트 불러오기
import UserProfile from '../components/friends/UserProfile';
import FriendList from '../components/friends/FriendList';
import GuestBook from '../components/friends/GuestBook';

export default function Friends() {
    // 1. 상태 변경: 초기값을 빈 배열/null로 설정 (데이터 오기 전까지 비워둠)
    const [friends, setFriends] = useState([]);
    const [myProfile, setMyProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [target, setTarget] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [activeTab, setActiveTab] = useState('following');

    // 백엔드 데이터 불러오기(컴포넌트가 처음 뜰 때 1번 실행)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 내 정보(/users/me)와 친구 목록(/friends)을 동시에 요청
                const [userRes, friendsRes] = await Promise.all([
                    api.get('/users/me'),
                    api.get('/friends')
                ]);

                // 성공적으로 받아왔다면 상태 업데이트
                if (userRes.data.success) {
                    setMyProfile(userRes.data.data);
                }
                if (friendsRes.data.success) {
                    setFriends(friendsRes.data.data);
                }
            } catch (error) {
                console.error("데이터 로딩 실패:", error);
                // 403 에러가 뜨면 로그인이 안 된 상태
                if (error.response?.status === 403) {
                    alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 팔로우/언팔로우 API 연결
    const handleFollow = async (id) => {
        try {
            // 현재 팔로우 상태 확인
            const friend = friends.find(f => f.id === id);
            if (!friend) return;

            if (friend.isFollowing) {
                // 이미 팔로우 중이면 언팔로우(DELETE)
                await api.delete(`/friends/${id}`);
            } else {
                // 아니면 팔로우 요청(POST)
                await api.post(`/friends/${id}`);
            }

            // 성공하면 화면(Local State)도 업데이트해줘야 깜빡임 없이 즉시 반영됨
            setFriends(friends.map(f => f.id === id ? { ...f, isFollowing: !f.isFollowing } : f));

        } catch (error) {
            console.error("팔로우 요청 실패:", error);
            alert("요청을 처리할 수 없습니다.");
        }
    };

    // 로딩 중일 때 처리(데이터가 없으면 에러가 나므로 필수)
    if (loading || !myProfile) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중입니다...</div>;
    }

    // 데이터가 로드된 후 변수 할당
    const wallUser = target || myProfile;
    const isMe = target === null;

    const getDisplayList = () => {
        // 친구 데이터 필터링 로직
        if (keyword.trim()) return friends.filter(f => f.nickname.toLowerCase().includes(keyword.toLowerCase()));
        return activeTab === 'following' ? friends.filter(f => f.isFollowing) : friends.filter(f => f.isFollower);
    };

    const handleSaveComment = (text) => {
        // 방명록 API가 있다면 여기서 api.post('/guestbook', ...) 등을 호출해야 함
        // 지금은 일단 화면에서만 바뀌도록 유지
        const newComm = { id: Date.now(), writer: myProfile.nickname, text: text };

        if (isMe) {
            alert("내 담벼락에는 글을 남길 수 없습니다.");
        } else {
            const updatedFriends = friends.map(f => f.id === target.id ? { ...f, comments: [...(f.comments || []), newComm] } : f);
            setFriends(updatedFriends);
            setTarget({ ...target, comments: [...(target.comments || []), newComm] });
        }
    };

    return (
        <Container>
            {/* 왼쪽: 내 프로필 */}
            <Column className="left">
                <UserProfile
                    myInfo={myProfile}
                    isMe={isMe}
                    onResetTarget={() => setTarget(null)}
                />
            </Column>

            {/* 중앙: 친구 목록 */}
            <Column className="center">
                <FriendList
                    friends={friends}
                    keyword={keyword}
                    setKeyword={setKeyword}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    getDisplayList={getDisplayList}
                    handleFollow={handleFollow}
                    setTarget={setTarget}
                />
            </Column>

            {/* 오른쪽: 방명록 */}
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