import React, { useState } from 'react';
import styled from '@emotion/styled';

// 아이콘 라이브러리 (검색, 펜, 공유, 체크, 플러스 등)
import { FaSearch, FaPen, FaShareAlt, FaCheck, FaPlus, FaArrowRight, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { BiArrowBack } from 'react-icons/bi';

// 목업 데이터 (내 정보, 친구 목록)
import { MY_INFO, MOCK_FRIENDS } from '../mocks/mockData';

// --- 상수 및 유틸리티 ---

const THEME_COLOR = '#A0CEFD';
const ACCENT_COLOR = '#0088DD';

// 프로필 이미지 배경색 배열 (랜덤/ID 기반 배정용)
const PROFILE_COLORS = ['#828282', '#A0CEFD', '#0088DD'];

const getProfileColor = (id) => {
    if (!id) return PROFILE_COLORS[1];
    return PROFILE_COLORS[id % PROFILE_COLORS.length];
};

// --- 스타일 컴포넌트 정의 ---

// 전체 레이아웃 (3단 분할)
const Container = styled.div`
  display: flex; width: 100%; height: 100%; padding: 20px; gap: 20px; box-sizing: border-box;
  background-color: #000000; color: #ffffff;
`;

// 각 컬럼 스타일 (Left: 프로필, Center: 리스트, Right: 담벼락)
const Column = styled.div`
  background: #1a1a1a; border-radius: 20px; padding: 24px; border: 1px solid #333;
  display: flex; flex-direction: column; position: relative; height: 100%; box-sizing: border-box;
  &.left { flex: 1; align-items: flex-start; }
  &.center { flex: 1.2; }
  &.right { flex: 1; }
`;

const LeftHeader = styled.div`width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; height: 30px;`;

// 3D 캐릭터가 들어갈 영역
const ModelBox = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1.1; 
  background: #111; 
  border: 1px dashed #333; 
  border-radius: 20px;
  margin: 10px 0 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #444;
  font-weight: bold;
  font-size: 0.9rem;
`;

const IntroText = styled.p`
  margin: 0;
  color: #ddd;
  font-size: 1rem;
  line-height: 1.6;
  text-align: left;
  width: 100%;
  word-break: keep-all;
  white-space: pre-wrap; 
`;

// 검색바 스타일
const SearchBar = styled.div`
  display: flex; align-items: center; background: #252525; padding: 12px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #333; 
  input { border:none; background:transparent; outline:none; color:white; width:100%; }
`;

// 팔로잉/팔로워 탭 버튼
const TabContainer = styled.div`display: flex; border-bottom: 1px solid #333; margin-bottom: 15px;`;
const TabButton = styled.button`
  flex: 1; padding: 12px; background: none; border: none; cursor: pointer; font-size: 1rem; font-weight: bold;
  color: ${props => props.active ? THEME_COLOR : '#888'};
  border-bottom: 2px solid ${props => props.active ? THEME_COLOR : 'transparent'};
  &:hover { color: ${THEME_COLOR}; }
`;

// 친구 목록 리스트 영역
const List = styled.div` flex: 1; overflow-y: auto; width: 100%; `;
const Item = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 15px 10px; border-bottom: 1px solid #2a2a2a;
  &:hover { background: #222; } 
  .profile-section { display: flex; align-items: center; gap: 12px; }
  
  .p-img { 
    width: 45px; height: 45px; 
    border-radius: 50%; 
    background: ${props => props.color}; 
    flex-shrink: 0;
  }
  
  .info h4 { margin: 0 0 4px 0; color: #fff; font-size: 1rem; }
  .info p { margin: 0; color: #aaa; font-size: 0.85rem; }
  .actions { display: flex; align-items: center; gap: 15px; }
  .icon-btn { cursor: pointer; font-size: 1.2rem; color: #666; transition: 0.2s; display: flex; align-items: center; }
  .icon-btn.plus:hover { color: ${THEME_COLOR}; }
  .icon-btn.check { color: ${THEME_COLOR}; font-size: 1.4rem; } 
  .icon-btn.arrow:hover { color: white; }
`;

// 담벼락(방명록) 스타일
const WallList = styled.div`flex: 1; overflow-y: auto; background: #111; padding: 15px; border-radius: 15px; border: 1px solid #222; margin-bottom: 10px;`;
const CommentBubble = styled.div`
  margin-bottom: 15px; border-bottom: 1px solid #222; padding-bottom: 10px; 
  .writer { color: ${ACCENT_COLOR}; font-weight: bold; font-size: 0.9rem; display: block; margin-bottom:4px;} 
  .text { color: #eee; font-size: 0.95rem; }
`;

// 댓글 입력창 영역
const InputArea = styled.div`
  width: 100%; display: flex; gap: 10px; 
  input { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #444; background: #252525; color: white; } 
  button { background: ${ACCENT_COLOR}; color: white; border: none; padding: 0 20px; border-radius: 8px; cursor: pointer; font-weight: bold; }
`;

// 댓글 입력창 토글 버튼 (회전 애니메이션)
const ToggleButton = styled.div`
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.3s ease, color 0.3s ease;
  transform: ${props => props.isActive ? 'rotate(90deg)' : 'rotate(0deg)'}; 
  color: ${props => props.isActive ? '#ffffff' : ACCENT_COLOR};
  &:hover { color: #ffffff; }
`;

// --- 메인 컴포넌트 ---
export default function Friends() {
    // 상태 관리: 친구 목록, 선택된 유저(Target), 검색어, 탭, 입력창 표시 여부
    const [friends, setFriends] = useState(MOCK_FRIENDS);
    const [target, setTarget] = useState(null); // null이면 '나', 객체면 '친구'
    const [keyword, setKeyword] = useState('');
    const [activeTab, setActiveTab] = useState('following');
    const [showInput, setShowInput] = useState(false);
    const [tempMsg, setTempMsg] = useState('');

    // 현재 표시할 유저 정보 (Target이 없으면 내 정보)
    const currentUser = target || MY_INFO;
    const isMe = target === null;

    // 리스트 필터링 로직 (검색어가 있으면 검색 결과, 없으면 탭에 따라 분류)
    const getDisplayList = () => {
        if (keyword.trim()) return friends.filter(f => f.nickname.toLowerCase().includes(keyword.toLowerCase()));
        return activeTab === 'following' ? friends.filter(f => f.isFollowing) : friends.filter(f => f.isFollower);
    };

    // 팔로우 토글 핸들러
    const handleFollow = (id) => setFriends(friends.map(f => f.id === id ? { ...f, isFollowing: !f.isFollowing } : f));

    // 방명록 댓글 저장 핸들러
    const saveComment = () => {
        if (!tempMsg.trim()) return;
        const newComm = { id: Date.now(), writer: MY_INFO.nickname, text: tempMsg };
        if (isMe) alert("내 담벼락에는 글을 남길 수 없습니다.");
        else {
            // 친구 목록 상태 업데이트 및 현재 타겟 상태 업데이트
            setFriends(friends.map(f => f.id === target.id ? { ...f, comments: [...f.comments, newComm] } : f));
            setTarget({ ...target, comments: [...target.comments, newComm] });
        }
        setTempMsg('');
    };

    return (
        <Container>
            {/* 왼쪽 컬럼: 유저 프로필 및 3D 모델 */}
            <Column className="left">
                <LeftHeader>
                    {/* 타겟 유저가 있을 때만 뒤로가기 버튼 표시 */}
                    {!isMe ? <BiArrowBack onClick={() => setTarget(null)} style={{ cursor: 'pointer', color: THEME_COLOR }} size={28} /> : <div />}
                    <FaShareAlt size={20} color={THEME_COLOR} style={{ cursor: 'pointer' }} onClick={() => alert("공유!")} />
                </LeftHeader>

                <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 10px 0', lineHeight: '1' }}>
                    {currentUser.nickname}
                </h2>

                <ModelBox>
                    3D Character Area
                </ModelBox>

                <IntroText>
                    {currentUser.statusMessage || "상태 메시지가 없습니다."}
                </IntroText>
            </Column>

            {/* 중앙 컬럼: 친구 검색 및 리스트 */}
            <Column className="center">
                <SearchBar>
                    <FaSearch style={{ marginRight: '10px', color: THEME_COLOR }} />
                    <input
                        placeholder="Search users..."
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                    />
                    {/* 검색어가 있을 때만 X 버튼 표시 (클릭 시 삭제) */}
                    {keyword && (
                        <FaTimes
                            style={{ marginLeft: '10px', cursor: 'pointer', color: '#888' }}
                            onClick={() => setKeyword('')}
                        />
                    )}
                </SearchBar>

                {/* 검색 중이 아닐 때만 탭(Following/Followers) 표시 */}
                {!keyword && (
                    <TabContainer>
                        <TabButton active={activeTab === 'following'} onClick={() => setActiveTab('following')}>Following {friends.filter(f => f.isFollowing).length}</TabButton>
                        <TabButton active={activeTab === 'followers'} onClick={() => setActiveTab('followers')}>Followers {friends.filter(f => f.isFollower).length}</TabButton>
                    </TabContainer>
                )}

                <List>
                    {getDisplayList().map(f => (
                        <Item key={f.id} color={getProfileColor(f.id)}>
                            <div className="profile-section">
                                <div className="p-img" />
                                <div className="info">
                                    <h4>{f.nickname}</h4>
                                    <p>{f.statusMessage || "No status"}</p>
                                </div>
                            </div>
                            <div className="actions">
                                {/* 팔로우/언팔로우 버튼 */}
                                <div className={`icon-btn ${f.isFollowing ? 'check' : 'plus'}`}
                                    onClick={(e) => { e.stopPropagation(); handleFollow(f.id); }}>
                                    {f.isFollowing ? <FaCheck /> : <FaPlus />}
                                </div>
                                {/* 상세 보기(화살표) 버튼 */}
                                <div className="icon-btn arrow" onClick={() => setTarget(f)}>
                                    <FaArrowRight color={THEME_COLOR} />
                                </div>
                            </div>
                        </Item>
                    ))}
                </List>
            </Column>

            {/* 오른쪽 컬럼: 담벼락 (방명록) */}
            <Column className="right">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: ACCENT_COLOR }}>{currentUser.nickname}'s Wall</h3>
                    {/* 입력창 열기/닫기 토글 버튼 */}
                    <ToggleButton isActive={showInput} onClick={() => setShowInput(!showInput)}>
                        <FaPen />
                    </ToggleButton>
                </div>

                <WallList>
                    {currentUser.comments.map(c => <CommentBubble key={c.id}><span className="writer">{c.writer}</span><div className="text">{c.text}</div></CommentBubble>)}
                </WallList>

                {/* 입력창이 활성화된 경우에만 표시 */}
                {showInput && (
                    <InputArea>
                        <input value={tempMsg} onChange={(e) => setTempMsg(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && saveComment()} autoFocus />
                        <button onClick={saveComment}><FaPaperPlane /></button>
                    </InputArea>
                )}
            </Column>
        </Container>
    );
}