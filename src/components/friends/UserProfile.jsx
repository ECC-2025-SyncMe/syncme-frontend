import React, { useState, useEffect } from 'react';
import { BiArrowBack } from 'react-icons/bi';
import { FaShareAlt } from 'react-icons/fa';
import { theme } from '../../styles/theme';
import { LeftHeader, ModelBox, IntroText } from './UserProfileStyles';
import api from '../../api/axios';

export default function UserProfile({ myInfo, isMe, onResetTarget }) {
    const [summary, setSummary] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                if (isMe) {
                    const res = await api.get('/character/summary');
                    if (res.data.success) {
                        // 데이터가 객체({ date, text })로 오므로 .text
                        const data = res.data.data;
                        if (typeof data === 'object' && data.text) {
                            setSummary(data.text);
                        } else {
                            // 만약 그냥 문자열로 온다면 그대로 저장
                            setSummary(data);
                        }
                    }
                } else {
                    // 친구 프로필의 경우
                    const friendSummary = myInfo.summary || myInfo.statusMessage;
                    if (typeof friendSummary === 'object' && friendSummary.text) {
                        setSummary(friendSummary.text);
                    } else {
                        setSummary(friendSummary || "오늘의 기록이 없습니다.");
                    }
                }
            } catch (error) {
                console.error("요약 정보 불러오기 실패:", error);
                setSummary("오늘 하루를 기록해보세요!");
            }
        };

        fetchSummary();
    }, [isMe, myInfo]);

    const handleShare = async () => {
        try {
            if (isMe) {
                // 내 링크는 백엔드에서 생성해주는 공식 링크 사용
                const res = await api.get('/home/me/share-link');
                if (res.data.success) {
                    const shareUrl = res.data.data.shareLink;
                    await navigator.clipboard.writeText(shareUrl);
                    alert(`마이홈 링크가 복사되었습니다!\n${shareUrl}`);
                }
            } else {
                // 친구 링크 공유 시: 현재 접속한 도메인(window.location.origin)을 자동으로 가져옴
                if (myInfo?.userId) {
                    // 예: https://syncme-frontend.vercel.app + /home/ + u_6533...
                    const shareUrl = `${window.location.origin}/home/${myInfo.userId}`;
                    await navigator.clipboard.writeText(shareUrl);
                    alert(`친구의 마이홈 링크가 복사되었습니다!\n${shareUrl}`);
                } else {
                    alert("공유할 수 없는 사용자입니다.");
                }
            }
        } catch (error) {
            console.error("공유 링크 가져오기 실패:", error);
            alert("공유 링크를 가져오는 중 오류가 발생했습니다.");
        }
    };

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

                <FaShareAlt
                    size={20}
                    color={theme.colors.secondary}
                    style={{ cursor: 'pointer' }}
                    onClick={handleShare}
                    title="링크 공유하기"
                />
            </LeftHeader>

            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 10px 0', lineHeight: '1' }}>
                {myInfo.nickname}
            </h2>

            <ModelBox>
                My 3D Character
            </ModelBox>

            <IntroText>
                {summary || "로딩 중..."}
            </IntroText>
        </>
    );
}