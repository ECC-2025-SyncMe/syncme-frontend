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

    const [allHistory, setAllHistory] = useState([]);
    const [historyData, setHistoryData] = useState([]);

    const [randomComment, setRandomComment] = useState({ writer: "SyncMe", text: "오늘 하루도 힘내세요!" });
    const [loading, setLoading] = useState(true);

    // 날짜 클릭 시 (캘린더)
    const updateDashboard = async (targetDate) => {
        if (!isMe) return;

        const targetStr = toDateStr(targetDate);
        const todayStr = toDateStr(new Date());

        // 오늘 날짜
        if (targetStr === todayStr) {
            try {
                const res = await api.get('/status/today');
                if (res.data.success && res.data.data) {
                    const data = res.data.data;

                    // 값이 없으면 0으로 처리 (|| 0)
                    const energy = data.energy || 0;
                    const burden = data.burden || 0;
                    const passion = data.passion || 0;

                    const calcScore = data.totalScore || Math.round((energy + passion + (100 - burden)) / 3);

                    setDisplayData({
                        score: calcScore,
                        stats: { energy, burden, passion }
                    });
                    return;
                }
            } catch (error) {
                console.error("오늘 상태 불러오기 실패:", error);
            }
        }

        // 과거 날짜
        const foundData = allHistory.find(item => item.date === targetStr);

        if (foundData) {
            const energy = foundData.energy || 0;
            const burden = foundData.burden || 0;
            const passion = foundData.passion || 0;

            const calculatedScore = Math.round(
                (energy + passion + (100 - burden)) / 3
            );

            setDisplayData({
                score: calculatedScore,
                stats: { energy, burden, passion }
            });
        } else {
            // 데이터 없음
            setDisplayData({ score: 0, stats: { energy: 0, burden: 0, passion: 0 } });
        }
    };

    const calendar = useCalendar(updateDashboard);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                if (isMe) {
                    const userRes = await api.get('/users/me');
                    setMyInfo(userRes.data.data);

                    // --- 오늘 데이터 처리 ---
                    let todayData = null;
                    try {
                        const statusRes = await api.get('/status/today');
                        if (statusRes.data.success && statusRes.data.data) {
                            todayData = statusRes.data.data;

                            // 값이 null/undefined일 경우 0으로 강제 변환
                            const energy = todayData.energy || 0;
                            const burden = todayData.burden || 0;
                            const passion = todayData.passion || 0;

                            const currentScore = todayData.totalScore || Math.round(
                                (energy + passion + (100 - burden)) / 3
                            );

                            setDisplayData({
                                score: currentScore,
                                stats: { energy, burden, passion }
                            });
                        }
                    } catch (e) {
                        console.log("오늘 기록 없음");
                    }

                    // --- 히스토리 처리 ---
                    try {
                        const historyRes = await api.get('/status/history');
                        let items = historyRes.data.data.items || [];
                        const todayStr = toDateStr(new Date());

                        const hasToday = items.some(item => item.date === todayStr);
                        if (!hasToday && todayData) {
                            items.push({
                                date: todayStr,
                                energy: todayData.energy || 0,
                                burden: todayData.burden || 0,
                                passion: todayData.passion || 0
                            });
                        }

                        items.sort((a, b) => new Date(a.date) - new Date(b.date));
                        setAllHistory(items);

                        const recentItems = items.slice(-4); // 최근 4일

                        const chartData = recentItems.map(item => {
                            const e = item.energy || 0;
                            const p = item.passion || 0;
                            const b = item.burden || 0;

                            const calculatedScore = Math.round((e + p + (100 - b)) / 3);

                            return {
                                date: item.date,
                                shortDate: item.date.substring(5),
                                score: calculatedScore
                            };
                        });

                        setHistoryData(chartData);

                    } catch (e) {
                        console.error("히스토리 로드 실패", e);
                    }

                } else {
                    // 친구 홈
                    const friendRes = await api.get(`/home/${userId}`);
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
                recordedDates={allHistory.map(d => d.date)}
            />
            <DashboardGrid>
                <LeftStatPanel stats={displayData.stats} />
                <CenterModelPanel />
                <RightChartPanel historyData={historyData} score={displayData.score} />
            </DashboardGrid>
        </HomeContainer>
    );
}