import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    const { userId } = useParams();
    const isMe = !userId;

    const [myInfo, setMyInfo] = useState(null);
    const [displayData, setDisplayData] = useState({
        score: 0,
        stats: { energy: 0, burden: 0, passion: 0 }
    });
    const [historyData, setHistoryData] = useState([]);
    const [randomComment, setRandomComment] = useState({ writer: "SyncMe", text: "오늘 하루도 힘내세요!" });
    const [loading, setLoading] = useState(true);

    // 날짜 클릭 시 (캘린더)
    const updateDashboard = async (targetDate) => {
        if (!isMe) return;

        const targetStr = toDateStr(targetDate);
        const todayStr = toDateStr(new Date());

        if (targetStr !== todayStr) {
            // 과거 데이터 조회 API (/status/history/{date})가 있다면 연결
            // 현재는 0으로 초기화
            setDisplayData({ score: 0, stats: { energy: 0, burden: 0, passion: 0 } });
            return;
        }

        // 오늘 날짜로 돌아오면 다시 로드
        try {
            const res = await api.get('/status/today');
            if (res.data.success && res.data.data) {
                const data = res.data.data;
                setDisplayData({
                    score: data.totalScore || 0,
                    stats: {
                        energy: data.energy || 0,
                        burden: data.burden || 0,
                        passion: data.passion || 0
                    }
                });
            }
        } catch (error) {
            console.error("오늘 상태 불러오기 실패:", error);
        }
    };

    const calendar = useCalendar(updateDashboard);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                if (isMe) {
                    // 내 정보
                    const userRes = await api.get('/users/me');
                    setMyInfo(userRes.data.data);

                    // 오늘 상태
                    try {
                        const statusRes = await api.get('/status/today');
                        if (statusRes.data.success && statusRes.data.data) {
                            const data = statusRes.data.data;
                            setDisplayData({
                                score: data.totalScore || 0,
                                stats: { energy: data.energy, burden: data.burden, passion: data.passion }
                            });
                        }
                    } catch (e) {
                        // 오늘 기록이 없으면 0점 유지 (에러 아님)
                        console.log("오늘 기록 없음");
                    }

                    // 차트 데이터 (History) 처리
                    try {
                        const historyRes = await api.get('/status/history');
                        // API 구조: { data: { count: 3, items: [...] } }
                        const items = historyRes.data.data.items || [];

                        // 날짜 오름차순 정렬 (과거 -> 오늘)
                        items.sort((a, b) => new Date(a.date) - new Date(b.date));

                        // 차트 데이터 변환
                        const chartData = items.map(item => {
                            // 점수 계산 로직: (에너지 + 열정 + (100-부담)) / 3
                            // burden은 낮을수록 좋으므로 100에서 뺌
                            const calculatedScore = Math.round(
                                (item.energy + item.passion + (100 - item.burden)) / 3
                            );

                            return {
                                date: item.date.substring(5), // "2026-01-21" -> "01-21"
                                score: calculatedScore
                            };
                        });
                        setHistoryData(chartData);
                    } catch (e) {
                        console.error("히스토리 로드 실패", e);
                    }

                } else {
                    // 친구 홈 로직
                    const friendRes = await api.get(`/home/${userId}`);
                    // 백엔드 응답 구조에 따라 수정 (friendRes.data.data 안에 user, status가 있는지 확인)
                    // 가령 friendRes.data.data = { user: {...}, status: {...} } 라고 가정
                    const { user, status } = friendRes.data.data || {};

                    if (user) setMyInfo(user);
                    if (status) {
                        setDisplayData({
                            score: status.totalScore || 0,
                            stats: {
                                energy: status.energy || 0,
                                burden: status.burden || 0,
                                passion: status.passion || 0
                            }
                        });
                    }
                }
            } catch (error) {
                console.error("데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [userId, isMe]);

    if (loading) return <div>로딩 중...</div>;
    if (!myInfo) return <div>유저 정보를 찾을 수 없습니다.</div>;

    return (
        <HomeContainer>
            <DashboardHeader
                myInfo={myInfo}
                randomComment={randomComment}
                {...calendar}
                isReadOnly={!isMe}
                // recordedDates prop이 필요하다면 historyData에서 추출해서 전달 가능
                recordedDates={historyData.map(d => d.date)}
            />
            <DashboardGrid>
                <LeftStatPanel stats={displayData.stats} />
                <CenterModelPanel />
                <RightChartPanel historyData={historyData} score={displayData.score} />
            </DashboardGrid>
        </HomeContainer>
    );
}