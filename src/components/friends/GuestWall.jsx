import React, { useState } from 'react';
import { FaPen, FaPaperPlane } from 'react-icons/fa';
import { theme } from '../../styles/theme';
import { WallList, CommentBubble, InputArea, ToggleButton } from './GuestWallStyles';

export default function GuestWall({ wallUser, isMe, onSaveComment }) {
    const [showInput, setShowInput] = useState(false);
    const [tempMsg, setTempMsg] = useState('');

    const handleSave = () => {
        if (!tempMsg.trim()) return;
        onSaveComment(tempMsg);
        setTempMsg('');
    };

    // wallUser가 없으면 아무것도 안 그림
    if (!wallUser) return null;

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: theme.colors.primary }}>{wallUser.nickname}'s Wall</h3>
                {/* 내가 아닐 때만 글쓰기 버튼 표시 */}
                {!isMe && (
                    <ToggleButton isActive={showInput} onClick={() => setShowInput(!showInput)}>
                        <FaPen />
                    </ToggleButton>
                )}
            </div>

            <WallList>
                {(wallUser.comments || []).map(c => (
                    // key: commentId (없으면 id)
                    <CommentBubble key={c.commentId || c.id}>
                        {/* 작성자: authorNickname (없으면 writer) */}
                        <span className="writer">{c.authorNickname || c.writer}</span>
                        {/* 내용: content (없으면 text) */}
                        <div className="text">{c.content || c.text}</div>
                    </CommentBubble>
                ))}
                {/* 댓글이 없을 경우 안내 메시지  */}
                {(!wallUser.comments || wallUser.comments.length === 0) && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                        아직 작성된 방명록이 없습니다.
                    </div>
                )}
            </WallList>

            {showInput && !isMe && (
                <InputArea>
                    <input
                        value={tempMsg}
                        onChange={(e) => setTempMsg(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                        placeholder="담벼락에 글을 남겨보세요!"
                        autoFocus
                    />
                    <button onClick={handleSave}><FaPaperPlane /></button>
                </InputArea>
            )}
        </>
    );
}