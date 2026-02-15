import React, { useState, useEffect } from 'react';
import { BiArrowBack } from 'react-icons/bi';
import { FaShareAlt } from 'react-icons/fa';
import { theme } from '../../styles/theme';
import { LeftHeader, ModelBox, IntroText } from './UserProfileStyles';
import api from '../../api/axios';

// 캐릭터 로직 및 이미지 불러오기
import { getCharacterMood } from '../../utils/Characters/Character.js';
import stress from '../../assets/characters/stress.png';
import burning from '../../assets/characters/burning.png';
import happy from '../../assets/characters/happy.png';
import neutral from '../../assets/characters/neutral.png';

const moodImg = { stress, burning, happy, neutral };

export default function UserProfile({ myInfo, isMe, onResetTarget }) {
    const [summary, setSummary] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                if (isMe) {
                    const res = await api.get('/character/summary');
                    if (res.data.success) {
                        const data = res.data.data;
                        setSummary(typeof data === 'object' ? data.text : data);
                    }
                } else {
                    const friendSummary = myInfo.summary || myInfo.statusMessage;
                    setSummary(typeof friendSummary === 'object' ? friendSummary.text : (friendSummary || "오늘의 기록이 없습니다."));
                }
            } catch (error) {
                console.error("요약 정보 불러오기 실패:", error);
                setSummary("오늘 하루를 기록해보세요!");
            }
        };
        fetchSummary();
    }, [isMe, myInfo]);

    // 캐릭터 상태 계산 (myInfo 안에 status 정보가 있다고 가정)
    const mood = getCharacterMood(myInfo?.status || myInfo);

    const handleShare = async () => {
        try {
            let shareUrl = "";
            if (isMe) {
                const res = await api.get('/home/me/share-link');
                if (res.data.success) shareUrl = res.data.data.shareLink;
            } else if (myInfo?.userId) {
                shareUrl = `${window.location.origin}/home/${myInfo.userId}`;
            }

            if (shareUrl) {
                await navigator.clipboard.writeText(shareUrl);
                alert(`링크가 복사되었습니다!\n${shareUrl}`);
            }
        } catch (error) {
            alert("공유 링크 복사 실패");
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
                    />
                ) : <div />}
                <FaShareAlt
                    size={20}
                    color={theme.colors.secondary}
                    style={{ cursor: 'pointer' }}
                    onClick={handleShare}
                />
            </LeftHeader>

            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 10px 0', lineHeight: '1', color: '#fff' }}>
                {myInfo.nickname}
            </h2>

            {/* ModelBox 내부에 이미지 출력 */}
            <ModelBox style={{ overflow: 'hidden', padding: '10px' }}>
                <img
                    src={moodImg[mood]}
                    alt="Character"
                    style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                        borderRadius: '20px',
                        padding: '10px',
                        transition: 'all 0.5s ease',
                    }}
                />
            </ModelBox>

            <IntroText>
                {summary || "로딩 중..."}
            </IntroText>
        </>
    );
}