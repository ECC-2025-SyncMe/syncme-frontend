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

    // 전체 기록(달력용)과 차트용 데이터(최근 4일) 분리
    const [allHistory, setAllHistory] = useState([]);
    const [historyData, setHistoryData] = useState([]);

    const [randomComment, setRandomComment] = useState({ writer: "SyncMe", text: "오늘 하루도 힘내세요!" });
    const [loading, setLoading] = useState(true);

    // 날짜 클릭 시 (캘린더)
    const updateDashboard = async (targetDate) => {
        if (!isMe) return;

        const targetStr = toDateStr(targetDate);
        const todayStr = toDateStr(new Date());

        // 오늘 날짜면 API 다시 호출(최신 상태 반영)
        if (targetStr === todayStr) {
            try {
                const res = await api.get('/status/today');
                if (res.data.success && res.data.data) {
                    const data = res.data.data;
                    // 점수가 0이면 계산 로직 사용
                    const calcScore = data.totalScore || Math.round((data.energy + data.passion + (100 - data.burden)) / 3);

                    setDisplayData({
                        score: calcScore,
                        stats: {
                            energy: data.energy || 0,
                            burden: data.burden || 0,
                            passion: data.passion || 0
                        }
                    });
                    return;
                }
            } catch (error) {
                console.error("오늘 상태 불러오기 실패:", error);
            }
        }

        // 과거 날짜면 받아둔 히스토리(allHistory)에서 찾아서 표시
        const foundData = allHistory.find(item => item.date === targetStr);

        if (foundData) {
            // 점수 계산 
            const calculatedScore = Math.round(
                (foundData.energy + foundData.passion + (100 - foundData.burden)) / 3
            );

            setDisplayData({
                score: calculatedScore,
                stats: {
                    energy: foundData.energy,
                    burden: foundData.burden,
                    passion: foundData.passion
                }
            });
        } else {
            // 데이터가 없는 날짜
            setDisplayData({ score: 0, stats: { energy: 0, burden: 0, passion: 0 } });
        }
    };

    const calendar = useCalendar(updateDashboard);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                if (isMe) {
                    // 내 정보 가져오기
                    const userRes = await api.get('/users/me');
                    setMyInfo(userRes.data.data);

                    // 오늘 데이터 가져오기(변수에 저장해두고 히스토리와 합칠 예정)
                    let todayData = null;
                    try {
                        const statusRes = await api.get('/status/today');
                        if (statusRes.data.success && statusRes.data.data) {
                            todayData = statusRes.data.data;

                            // 메인 화면 점수 표시 (totalScore가 0이면 직접 계산)
                            const currentScore = todayData.totalScore || Math.round(
                                (todayData.energy + todayData.passion + (100 - todayData.burden)) / 3
                            );

                            setDisplayData({
                                score: currentScore,
                                stats: {
                                    energy: todayData.energy,
                                    burden: todayData.burden,
                                    passion: todayData.passion
                                }
                            });
                        }
                    } catch (e) {
                        console.log("오늘 기록 없음");
                    }

                    // 히스토리 가져오기 및 차트 구성
                    try {
                        const historyRes = await api.get('/status/history');
                        let items = historyRes.data.data.items || [];
                        const todayStr = toDateStr(new Date());

                        // 히스토리 목록에 오늘 날짜가 없으면 오늘 데이터를 강제로 추가
                        const hasToday = items.some(item => item.date === todayStr);
                        if (!hasToday && todayData) {
                            items.push({
                                date: todayStr,
                                energy: todayData.energy,
                                burden: todayData.burden,
                                passion: todayData.passion
                            });
                        }

                        // 날짜 오름차순 정렬 (옛날 -> 최신)
                        items.sort((a, b) => new Date(a.date) - new Date(b.date));

                        // 달력 점 찍기용 전체 데이터 저장
                        setAllHistory(items);

                        // 차트용: 최근 4일치만 자르기 (.slice(-4))
                        const recentItems = items.slice(-4);

                        // 차트 데이터 포맷팅
                        const chartData = recentItems.map(item => {
                            const calculatedScore = Math.round(
                                (item.energy + item.passion + (100 - item.burden)) / 3
                            );

                            return {
                                date: item.date,
                                shortDate: item.date.substring(5), // "02-15"
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
                // 전체 히스토리를 전달하여 달력에 점 표시
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