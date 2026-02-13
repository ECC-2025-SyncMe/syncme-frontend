import React, { useState } from 'react';
import { MY_INFO, MOCK_FRIENDS } from '../mocks/mockData';

// 레이아웃 스타일 불러오기
import { Container, Column } from './FriendsStyles';

// 하위 컴포넌트 불러오기(각자 스타일을 가지고 있음)
import UserProfile from '../components/friends/UserProfile';
import FriendList from '../components/friends/FriendList';
import GuestBook from '../components/friends/GuestBook';

export default function Friends() {
    const [friends, setFriends] = useState(MOCK_FRIENDS);
    const [target, setTarget] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [activeTab, setActiveTab] = useState('following');

    const myProfile = MY_INFO;
    const wallUser = target || MY_INFO;
    const isMe = target === null;

    const getDisplayList = () => {
        if (keyword.trim()) return friends.filter(f => f.nickname.toLowerCase().includes(keyword.toLowerCase()));
        return activeTab === 'following' ? friends.filter(f => f.isFollowing) : friends.filter(f => f.isFollower);
    };

    const handleFollow = (id) => {
        setFriends(friends.map(f => f.id === id ? { ...f, isFollowing: !f.isFollowing } : f));
    };

    const handleSaveComment = (text) => {
        const newComm = { id: Date.now(), writer: MY_INFO.nickname, text: text };
        if (isMe) {
            alert("내 담벼락에는 글을 남길 수 없습니다.");
        } else {
            const updatedFriends = friends.map(f => f.id === target.id ? { ...f, comments: [...f.comments, newComm] } : f);
            setFriends(updatedFriends);
            // 타겟 상태도 업데이트해줘야 화면에 즉시 반영됨
            setTarget({ ...target, comments: [...target.comments, newComm] });
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