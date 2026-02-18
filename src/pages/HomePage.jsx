import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
    const location = useLocation(); // 현재 위치 정보 가져오기(페이지 이동 감지용)
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

    /**
     * 점수 계산 로직
     */
    const calculateTotalScore = (stats) => {
        if (!stats || (stats.energy === 0 && stats.burden === 0 && stats.passion === 0)) {
            return 0;
        }
        const { energy, burden, passion } = stats;
        return Math.round((energy + passion + (100 - burden)) / 3);
    };

    // 날짜 클릭 시 대시보드 업데이트 로직
    const updateDashboard = async (targetDate) => {
        if (!isMe) return;

        const targetStr = toDateStr(targetDate);
        const todayStr = toDateStr(new Date());

        // 오늘 날짜를 클릭했다면 서버에서 최신 상태를 다시 가져옴
        if (targetStr === todayStr) {
            try {
                const res = await api.get('/status/today');
                if (res.data.success && res.data.data) {
                    const data = res.data.data;
                    const stats = {
                        energy: data.energy || 0,
                        burden: data.burden || data.pressure || 0, // 필드명 호환
                        passion: data.passion || 0
                    };
                    setDisplayData({
                        score: data.totalScore || calculateTotalScore(stats),
                        stats: stats
                    });
                    return;
                }
            } catch (error) {
                console.error("오늘 상태 불러오기 실패:", error);
            }
        }

        const foundData = allHistory.find(item => item.date === targetStr);
        if (foundData) {
            const stats = {
                energy: foundData.energy || 0,
                burden: foundData.burden || 0,
                passion: foundData.passion || 0
            };
            setDisplayData({
                score: calculateTotalScore(stats),
                stats: stats
            });
        } else {
            // 기록이 없는 날짜
            setDisplayData({ score: 0, stats: { energy: 0, burden: 0, passion: 0 } });
        }
    };

    const calendar = useCalendar(updateDashboard);

    // useEffect 수정: location.key를 추가하여 페이지 진입 시마다 실행
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                if (isMe) {
                    // 내 정보 가져오기
                    const userRes = await api.get('/users/me');
                    setMyInfo(userRes.data.data);

                    let todayStats = { energy: 0, burden: 0, passion: 0 };
                    let todayScore = 0;

                    // 오늘 상태 가져오기
                    try {
                        const statusRes = await api.get('/status/today');
                        if (statusRes.data.success && statusRes.data.data) {
                            const todayData = statusRes.data.data;
                            todayStats = {
                                energy: todayData.energy || 0,
                                burden: todayData.burden || todayData.pressure || 0,
                                passion: todayData.passion || 0
                            };
                            todayScore = todayData.totalScore || calculateTotalScore(todayStats);

                            setDisplayData({
                                score: todayScore,
                                stats: todayStats
                            });
                        }
                    } catch (e) { console.log("오늘 기록 없음"); }

                    // 히스토리 로드
                    try {
                        const historyRes = await api.get('/status/history');
                        let items = historyRes.data.data.items || [];
                        const todayStr = toDateStr(new Date());

                        // 오늘 기록이 히스토리에 아직 안 들어갔다면 수동으로 추가(그래프용)
                        const hasToday = items.some(item => item.date === todayStr);
                        if (!hasToday && todayScore > 0) {
                            items.push({ date: todayStr, ...todayStats });
                        }

                        items.sort((a, b) => new Date(a.date) - new Date(b.date));
                        setAllHistory(items);

                        const chartData = items.slice(-7).map(item => ({
                            date: item.date,
                            shortDate: item.date.substring(5),
                            score: calculateTotalScore(item)
                        }));
                        setHistoryData(chartData);
                    } catch (e) { console.error("히스토리 로드 실패", e); }

                } else {
                    // --- 친구 홈 정보 ---
                    try {
                        const friendRes = await api.get(`/home/${userId}`);
                        const resData = friendRes.data.data;

                        if (resData) {
                            setMyInfo(resData.user || resData);
                            const status = resData.status || null;
                            const stats = {
                                energy: status?.energy || 0,
                                burden: status?.burden || status?.pressure || 0,
                                passion: status?.passion || 0
                            };

                            setDisplayData({
                                score: status ? (status.totalScore || calculateTotalScore(stats)) : 0,
                                stats: stats
                            });

                            const historyItems = (resData.history && resData.history.length > 0)
                                ? resData.history
                                : (status ? [status] : []);

                            const chartData = historyItems.slice(-7).map(item => ({
                                date: item.date,
                                shortDate: item.date ? item.date.substring(5) : 'Today',
                                score: calculateTotalScore(item)
                            }));
                            setHistoryData(chartData);
                        }
                    } catch (error) {
                        console.error("친구 데이터 로드 실패:", error);
                    }
                }
            } catch (error) {
                console.error("데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [userId, isMe, location.key]); // location.key가 바뀌면(페이지 이동 시) 무조건 재실행

    if (loading) return <div style={{ color: '#fff', padding: '20px' }}>로딩 중...</div>;
    if (!myInfo) return <div style={{ color: '#fff', padding: '20px' }}>유저 정보를 찾을 수 없습니다.</div>;

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
                <CenterModelPanel stats={displayData.stats} />
                <RightChartPanel historyData={historyData} score={displayData.score} />
            </DashboardGrid>
        </HomeContainer>
    );
}