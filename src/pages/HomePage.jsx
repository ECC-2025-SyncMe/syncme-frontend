import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { toDateStr } from '../utils/dateUtils';
import { useCalendar } from '../hooks/useCalendar';
import { HomeContainer, DashboardGrid } from './HomeStyles';

import DashboardHeader from '../components/home/DashboardHeader';
import LeftStatPanel from '../components/home/LeftStatPanel';
import CenterModelPanel from '../components/home/CenterModelPanel';
import RightChartPanel from '../components/home/RightChartPanel';

export default function Home() {
    const { userId } = useParams();
    const location = useLocation();
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

    // 점수 계산 헬퍼 함수
    const calculateTotalScore = (stats) => {
        if (!stats || (stats.energy === 0 && stats.burden === 0 && stats.passion === 0)) {
            return 0;
        }
        const { energy, burden, passion } = stats;
        return Math.round((energy + passion + (100 - burden)) / 3);
    };

    // 랜덤 코멘트 선택 함수
    const pickRandomComment = (comments) => {
        if (!comments || comments.length === 0) return;
        const randomIndex = Math.floor(Math.random() * comments.length);
        const picked = comments[randomIndex];
        setRandomComment({
            writer: picked.authorNickname || picked.writer || '익명',
            text: picked.content || picked.text || '내용 없음'
        });
    };

    const updateDashboard = async (targetDate) => {
        if (!isMe) return;
        const targetStr = toDateStr(targetDate);
        const todayStr = toDateStr(new Date());

        if (targetStr === todayStr) {
            try {
                const res = await api.get('/status/today');
                if (res.data.success && res.data.data) {
                    const data = res.data.data;
                    const stats = {
                        energy: data.energy || 0,
                        burden: data.burden || data.pressure || 0,
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
            setDisplayData({ score: 0, stats: { energy: 0, burden: 0, passion: 0 } });
        }
    };

    const calendar = useCalendar(updateDashboard);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                if (isMe) {
                    // 내 홈 접속
                    const [userRes, statusRes, historyRes, commentsRes] = await Promise.allSettled([
                        api.get('/users/me'),
                        api.get('/status/today'),
                        api.get('/status/history'),
                        api.get('/comments/received')
                    ]);

                    if (userRes.status === 'fulfilled' && userRes.value.data.success) {
                        setMyInfo(userRes.value.data.data);
                    }

                    if (statusRes.status === 'fulfilled' && statusRes.value.data.success && statusRes.value.data.data) {
                        const s = statusRes.value.data.data;
                        const stats = { energy: s.energy || 0, burden: s.burden || s.pressure || 0, passion: s.passion || 0 };
                        setDisplayData({ score: s.totalScore || calculateTotalScore(stats), stats });
                    }

                    if (historyRes.status === 'fulfilled' && historyRes.value.data.success) {
                        const items = historyRes.value.data.data.items || [];
                        setAllHistory(items);
                        setHistoryData(items.slice(-7).map(item => ({
                            date: item.date,
                            shortDate: item.date.substring(5),
                            score: calculateTotalScore(item)
                        })));
                    }

                    if (commentsRes.status === 'fulfilled' && commentsRes.value.data.success) {
                        pickRandomComment(commentsRes.value.data.data);
                    }

                } else {
                    // 공유 링크 접속 (userId 기반 데이터 강제 조회)
                    const userRes = await api.get(`/home/${userId}`);

                    if (userRes.data.success) {
                        setMyInfo(userRes.data.data); // 유저 정보 세팅

                        // 유저 ID를 파라미터로 넘겨 해당 유저의 점수와 히스토리를 가져옴
                        const [statusRes, historyRes, commentsRes] = await Promise.allSettled([
                            api.get(`/status/today?userId=${userId}`),
                            api.get(`/status/history?userId=${userId}`),
                            api.get(`/friends/${userId}/comments`)
                        ]);

                        if (statusRes.status === 'fulfilled' && statusRes.value.data.success && statusRes.value.data.data) {
                            const s = statusRes.value.data.data;
                            const stats = { energy: s.energy || 0, burden: s.burden || s.pressure || 0, passion: s.passion || 0 };
                            setDisplayData({ score: s.totalScore || calculateTotalScore(stats), stats });
                        }

                        if (historyRes.status === 'fulfilled' && historyRes.value.data.success) {
                            const items = historyRes.value.data.data.items || [];
                            setAllHistory(items);
                            setHistoryData(items.slice(-7).map(item => ({
                                date: item.date,
                                shortDate: item.date.substring(5),
                                score: calculateTotalScore(item)
                            })));
                        }

                        if (commentsRes.status === 'fulfilled' && commentsRes.value.data.success) {
                            pickRandomComment(commentsRes.value.data.data);
                        }
                    }
                }
            } catch (error) {
                console.error("데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [userId, isMe, location.key]);

    if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>로딩 중...</div>;
    if (!myInfo) return <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>정보를 불러올 수 없습니다.</div>;

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