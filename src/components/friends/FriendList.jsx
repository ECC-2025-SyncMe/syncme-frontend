import React from 'react';
import { FaSearch, FaTimes, FaCheck, FaPlus, FaArrowRight } from 'react-icons/fa';
import { theme } from '../../styles/theme';
import { SearchBar, TabContainer, TabButton, List, Item } from './FriendListStyles';

const PROFILE_COLORS = ['#828282', '#A0CEFD', '#0088DD', '#FFB6C1', '#98FB98'];
const getProfileColor = (idx) => PROFILE_COLORS[idx % PROFILE_COLORS.length];

export default function FriendList({
    keyword, setKeyword, activeTab, setActiveTab,
    getDisplayList, handleFollow, setTarget,
    followingCount, followerCount
}) {
    const displayList = getDisplayList();

    return (
        <>
            <SearchBar>
                <FaSearch style={{ marginRight: '10px', color: theme.colors.secondary }} />
                <input
                    placeholder="친구 닉네임 검색..."
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                />
                {keyword && (
                    <FaTimes
                        style={{ marginLeft: '10px', cursor: 'pointer', color: '#888' }}
                        onClick={() => setKeyword('')}
                    />
                )}
            </SearchBar>

            {/* 검색 중이 아닐 때만 탭 표시 */}
            {!keyword && (
                <TabContainer>
                    <TabButton active={activeTab === 'following'} onClick={() => setActiveTab('following')}>
                        Following {followingCount}
                    </TabButton>
                    <TabButton active={activeTab === 'followers'} onClick={() => setActiveTab('followers')}>
                        Followers {followerCount}
                    </TabButton>
                </TabContainer>
            )}

            <List>
                {displayList.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                        {keyword ? "검색 결과가 없습니다." : "목록이 비어있습니다."}
                    </div>
                ) : (
                    displayList.map((f, idx) => (
                        // userId를 키로 사용
                        <Item key={f.userId} color={getProfileColor(idx)}>
                            <div className="profile-section">
                                <div className="p-img" />
                                <div className="info">
                                    <h4>{f.nickname}</h4>
                                    <p>{f.email || f.statusMessage || "SyncMe User"}</p>
                                </div>
                            </div>
                            <div className="actions">
                                {/* 팔로우/언팔로우 버튼 */}
                                <div className={`icon-btn ${f.isFollowing ? 'check' : 'plus'}`}
                                    onClick={(e) => { e.stopPropagation(); handleFollow(f.userId); }}>
                                    {f.isFollowing ? <FaCheck /> : <FaPlus />}
                                </div>
                                {/* 상세 보기(화살표) 버튼 */}
                                <div className="icon-btn arrow" onClick={() => setTarget(f)}>
                                    <FaArrowRight color={theme.colors.secondary} />
                                </div>
                            </div>
                        </Item>
                    ))
                )}
            </List>
        </>
    );
}