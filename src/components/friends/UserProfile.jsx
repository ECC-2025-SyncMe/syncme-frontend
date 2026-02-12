import React from 'react';
import { BiArrowBack } from 'react-icons/bi';
import { FaShareAlt } from 'react-icons/fa';
import { theme } from '../../styles/theme';
import { LeftHeader, ModelBox, IntroText } from './UserProfileStyles';

export default function UserProfile({ myInfo, isMe, onResetTarget }) {
    return (
        <>
            <LeftHeader>
                {!isMe ? (
                    <BiArrowBack
                        onClick={onResetTarget}
                        style={{ cursor: 'pointer', color: theme.colors.secondary }}
                        size={28}
                        title="내 방명록으로 돌아가기"
                    />
                ) : <div />}
                <FaShareAlt size={20} color={theme.colors.secondary} style={{ cursor: 'pointer' }} onClick={() => alert("공유!")} />
            </LeftHeader>

            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 10px 0', lineHeight: '1' }}>
                {myInfo.nickname}
            </h2>

            <ModelBox>
                My 3D Character
            </ModelBox>

            <IntroText>
                {myInfo.statusMessage || "상태 메시지가 없습니다."}
            </IntroText>
        </>
    );
}