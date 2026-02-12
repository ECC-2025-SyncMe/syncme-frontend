import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toDateStr } from '../utils/dateUtils';
import { useCalendar } from '../hooks/useCalendar';

import { HomeContainer, DashboardGrid } from './HomeStyles';

// 하위 컴포넌트
import DashboardHeader from '../components/home/DashboardHeader';
import LeftStatPanel from '../components/home/LeftStatPanel';
import CenterModelPanel from '../components/home/CenterModelPanel';
import RightChartPanel from '../components/home/RightChartPanel';

export default function Home() {
    const [myInfo, setMyInfo] = useState(null);
    const [displayData, setDisplayData] = useState({
        score: 0,
        stats: { energy: 0, burden: 0, passion: 0 }
    });
    const [historyData, setHistoryData] = useState([]); // 차트 데이터
    const [randomComment, setRandomComment] = useState({ writer: "SyncMe", text: "오늘 하루도 힘내세요!" });
    const [loading, setLoading] = useState(true);

    // 날짜가 바뀔 때 실행될 함수
    const updateDashboard = async (targetDate) => {
        const targetStr = toDateStr(targetDate);
        const todayStr = toDateStr(new Date());

        // 미래 날짜거나 오늘이 아니면 데이터가 없다고 가정(추후 날짜별 조회 API 필요)
        if (targetStr !== todayStr) {
            setDisplayData({ score: 0, stats: { energy: 0, burden: 0, passion: 0 } });
            return;
        }

        try {
            // 오늘 날짜 데이터 가져오기(/status/today)
            const res = await api.get('/status/today');

            if (res.data.success && res.data.data) {
                const data = res.data.data;
                setDisplayData({
                    score: data.totalScore || 0, // 총점
                    stats: {
                        energy: data.energy || 0,
                        burden: data.burden || 0,
                        passion: data.passion || 0
                    }
                });
            } else {
                // 오늘 기록이 없는 경우 0으로 초기화
                setDisplayData({ score: 0, stats: { energy: 0, burden: 0, passion: 0 } });
            }
        } catch (error) {
            console.error("오늘 상태 불러오기 실패:", error);
            // 404(데이터 없음) 에러는 정상이므로 0점으로 처리
            setDisplayData({ score: 0, stats: { energy: 0, burden: 0, passion: 0 } });
        }
    };

    // --- Custom Hook 연결 ---
    const calendar = useCalendar(updateDashboard);

    // 페이지 로드 시 '내 정보'와 '오늘 상태' 가져오기
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 내 정보 가져오기(/users/me)
                const userRes = await api.get('/users/me');
                if (userRes.data.success) {
                    const userData = userRes.data.data;
                    setMyInfo(userData);

                    // 방명록(comments) 중 랜덤 하나
                    const comments = userData.comments || [];
                    if (comments.length > 0) {
                        const randomIdx = Math.floor(Math.random() * comments.length);
                        setRandomComment(comments[randomIdx]);
                    }
                }

                // 오늘 상태 데이터 가져오기(초기 실행)
                await updateDashboard(new Date());

                // [차트용 히스토리] 
                // 아직 '과거 기록 조회 API'가 없다면 일단 현재 점수만 보여주거나 빈 배열 처리
                // 여기서는 임시로 오늘 점수만 차트에 표시하도록 설정
                setHistoryData([
                    { date: '3일전', score: 0 },
                    { date: '2일전', score: 0 },
                    { date: '1일전', score: 0 },
                    { date: '오늘', score: displayData?.score || 0 }
                ]);

            } catch (error) {
                console.error("초기 데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // 로딩 중일 때 표시
    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>데이터 불러오는 중...</div>;

    // 내 정보가 아직 로드 안 됐으면 렌더링 안 함
    if (!myInfo) return null;

    // --- View (JSX) ---
    return (
        <HomeContainer>
            <DashboardHeader
                myInfo={myInfo}
                randomComment={randomComment}
                {...calendar}
            />

            <DashboardGrid>
                {/* 실제 stats 데이터 전달 */}
                <LeftStatPanel stats={displayData.stats} />

                {/* 중앙 캐릭터 (데이터에 따라 표정 바뀌는 로직은 내부에 있음) */}
                <CenterModelPanel />

                {/* 차트와 점수 전달 */}
                <RightChartPanel historyData={historyData} score={displayData.score} />
            </DashboardGrid>
        </HomeContainer>
    );
}