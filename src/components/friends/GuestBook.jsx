import React, { useState } from 'react';
import { FaPen, FaPaperPlane } from 'react-icons/fa';
import { theme } from '../../styles/theme';
import { WallList, CommentBubble, InputArea, ToggleButton } from './GuestBookStyles';

export default function GuestBook({ wallUser, isMe, onSaveComment }) {
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
                    <CommentBubble key={c.id}>
                        <span className="writer">{c.writer}</span>
                        <div className="text">{c.text}</div>
                    </CommentBubble>
                ))}
            </WallList>

            {showInput && !isMe && (
                <InputArea>
                    <input
                        value={tempMsg}
                        onChange={(e) => setTempMsg(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                        placeholder="방명록을 남겨보세요"
                        autoFocus
                    />
                    <button onClick={handleSave}><FaPaperPlane /></button>
                </InputArea>
            )}
        </>
    );
}