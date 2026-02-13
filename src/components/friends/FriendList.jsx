import React from 'react';
import { FaSearch, FaTimes, FaCheck, FaPlus, FaArrowRight } from 'react-icons/fa';
import { theme } from '../../styles/theme';
import { SearchBar, TabContainer, TabButton, List, Item } from './FriendListStyles';

const PROFILE_COLORS = ['#828282', '#A0CEFD', '#0088DD'];
const getProfileColor = (id) => PROFILE_COLORS[id % PROFILE_COLORS.length] || PROFILE_COLORS[1];

export default function FriendList({
    friends, keyword, setKeyword, activeTab, setActiveTab,
    getDisplayList, handleFollow, setTarget
}) {
    return (
        <>
            <SearchBar>
                <FaSearch style={{ marginRight: '10px', color: theme.colors.secondary }} />
                <input
                    placeholder="Search users..."
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

            {!keyword && (
                <TabContainer>
                    <TabButton active={activeTab === 'following'} onClick={() => setActiveTab('following')}>
                        Following {friends.filter(f => f.isFollowing).length}
                    </TabButton>
                    <TabButton active={activeTab === 'followers'} onClick={() => setActiveTab('followers')}>
                        Followers {friends.filter(f => f.isFollower).length}
                    </TabButton>
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
                            <div className={`icon-btn ${f.isFollowing ? 'check' : 'plus'}`}
                                onClick={(e) => { e.stopPropagation(); handleFollow(f.id); }}>
                                {f.isFollowing ? <FaCheck /> : <FaPlus />}
                            </div>
                            <div className="icon-btn arrow" onClick={() => setTarget(f)}>
                                <FaArrowRight color={theme.colors.secondary} />
                            </div>
                        </div>
                    </Item>
                ))}
            </List>
        </>
    );
}