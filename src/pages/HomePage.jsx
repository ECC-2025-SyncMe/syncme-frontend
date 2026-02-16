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

// 캐릭터 이미지 및 로직 추가
import { getCharacterMood } from '../utils/Characters/Character.js';
import stress from '../assets/characters/stress.png';
import burning from '../assets/characters/burning.png';
import happy from '../assets/characters/happy.png';
import neutral from '../assets/characters/neutral.png';

// 이미지 매핑 객체
const moodImg = { stress, burning, happy, neutral };

export default function Home() {
    const { userId } = useParams();
    const isMe = !userId; // userId가 없으면 내 홈, 있으면 친구 홈

    const [myInfo, setMyInfo] = useState(null);
    const [displayData, setDisplayData] = useState({
        score: 0,
        stats: { energy: 0, burden: 0, passion: 0 }
    });

    const [allHistory, setAllHistory] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [randomComment, setRandomComment] = useState({ writer: "SyncMe", text: "오늘 하루도 힘내세요!" });
    const [loading, setLoading] = useState(true);

    // 날짜 클릭 시 대시보드 업데이트 (내 홈에서만 작동)
    const updateDashboard = async (targetDate) => {
        if (!isMe) return;

        const targetStr = toDateStr(targetDate);
        const todayStr = toDateStr(new Date());

        if (targetStr === todayStr) {
            try {
                const res = await api.get('/status/today');
                if (res.data.success && res.data.data) {
                    const data = res.data.data;
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

        const foundData = allHistory.find(item => item.date === targetStr);
        if (foundData) {
            const energy = foundData.energy || 0;
            const burden = foundData.burden || 0;
            const passion = foundData.passion || 0;
            const calculatedScore = Math.round((energy + passion + (100 - burden)) / 3);

            setDisplayData({
                score: calculatedScore,
                stats: { energy, burden, passion }
            });
        } else {
            setDisplayData({ score: 0, stats: { energy: 0, burden: 0, passion: 0 } });
        }
    };

    const calendar = useCalendar(updateDashboard);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                if (isMe) {
                    // --- 내 정보 및 오늘 상태 가져오기 ---
                    const userRes = await api.get('/users/me');
                    setMyInfo(userRes.data.data);

                    let todayData = null;
                    try {
                        const statusRes = await api.get('/status/today');
                        if (statusRes.data.success && statusRes.data.data) {
                            todayData = statusRes.data.data;
                            const energy = todayData.energy || 0;
                            const burden = todayData.burden || 0;
                            const passion = todayData.passion || 0;
                            const currentScore = todayData.totalScore || Math.round((energy + passion + (100 - burden)) / 3);

                            setDisplayData({
                                score: currentScore,
                                stats: { energy, burden, passion }
                            });
                        }
                    } catch (e) { console.log("오늘 기록 없음"); }

                    // --- 히스토리 로드 ---
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

                        const chartData = items.slice(-4).map(item => ({
                            date: item.date,
                            shortDate: item.date.substring(5),
                            score: Math.round(((item.energy || 0) + (item.passion || 0) + (100 - (item.burden || 0))) / 3)
                        }));
                        setHistoryData(chartData);
                    } catch (e) { console.error("히스토리 로드 실패", e); }

                } else {
                    // --- 친구 홈 정보 가져오기 ---
                    try {
                        const friendRes = await api.get(`/home/${userId}`);
                        const resData = friendRes.data.data;

                        if (resData) {
                            // 유저 정보 세팅(resData 구조에 따라 유연하게 처리)
                            const userInfo = resData.user || resData;
                            setMyInfo(userInfo);

                            // 상태 점수 세팅
                            const status = resData.status || null;

                            // 데이터가 아예 없으면 기본값 33점 설정
                            const currentScore = status ? (status.totalScore || status.score) : 33;
                            const currentEnergy = status ? status.energy : 0;
                            const currentBurden = status ? status.burden : 0;
                            const currentPassion = status ? status.passion : 0;

                            setDisplayData({
                                score: currentScore,
                                stats: {
                                    energy: currentEnergy,
                                    burden: currentBurden,
                                    passion: currentPassion
                                }
                            });

                            // 그래프 데이터(historyData) 만들기
                            // 만약 서버에서 history를 안 주면, 현재 상태(status)라도 하나 넣어서 점을 찍어줌
                            let historyItems = [];

                            if (resData.history && Array.isArray(resData.history)) {
                                historyItems = resData.history;
                            } else if (status) {
                                // 히스토리 없으면 오늘(혹은 최근) 상태 하나라도 넣음
                                historyItems = [status];
                            } else {
                                // 데이터가 없으면 기본 33점짜리 가짜 데이터라도 넣음(그래프 표시용)
                                historyItems = [{
                                    date: toDateStr(new Date()),
                                    score: 33,
                                    energy: 0, burden: 0, passion: 0
                                }];
                            }

                            // 그래프용 데이터로 가공
                            const chartData = historyItems.slice(-7).map(item => ({
                                date: item.date,
                                shortDate: item.date ? item.date.substring(5) : 'Today',
                                score: item.totalScore || item.score || Math.round(((item.energy || 0) + (item.passion || 0) + (100 - (item.burden || 0))) / 3)
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
    }, [userId, isMe]);

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
                <LeftStatPanel stats={displayData.stats || { energy: 0, burden: 0, passion: 0 }} />

                <CenterModelPanel stats={displayData.stats || { energy: 0, burden: 0, passion: 0 }} />

                <RightChartPanel historyData={historyData} score={displayData.score} />
            </DashboardGrid>
        </HomeContainer>
    );
}