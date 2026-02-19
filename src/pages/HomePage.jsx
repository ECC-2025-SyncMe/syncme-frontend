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
    const isMe = !userId; // userId 파라미터가 없으면 내 홈

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

    // 캘린더 날짜 클릭 시 대시보드 업데이트
    const updateDashboard = async (targetDate) => {
        const targetStr = toDateStr(targetDate);
        const todayStr = toDateStr(new Date());

        // 내 홈이고, 오늘 날짜를 클릭했을 때만 API 재호출(상태 변경 가능성)
        if (isMe && targetStr === todayStr) {
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

        // 그 외(남의 홈이거나 과거 날짜)는 이미 받아온 allHistory에서 찾아서 표시
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
                        // 차트용 데이터 가공
                        const sortedItems = [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
                        const recentItems = sortedItems.slice(0, 7).reverse();
                        setHistoryData(recentItems.map(item => ({
                            date: item.date,
                            shortDate: item.date.substring(5),
                            score: calculateTotalScore(item)
                        })));
                    }

                    if (commentsRes.status === 'fulfilled' && commentsRes.value.data.success) {
                        pickRandomComment(commentsRes.value.data.data);
                    }

                } else {
                    const response = await api.get(`/home/${userId}`);

                    if (response.data.success) {
                        const data = response.data.data;

                        // 유저 정보 세팅
                        setMyInfo({
                            userId: data.userId,
                            nickname: data.nickname,
                            isFollowing: data.isFollowing
                        });

                        // 오늘 상태(Today Status) 세팅
                        if (data.todayStatus && data.todayStatus.exists) {
                            const ts = data.todayStatus;
                            const stats = {
                                energy: ts.energy,
                                burden: ts.burden,
                                passion: ts.passion
                            };
                            setDisplayData({
                                score: calculateTotalScore(stats),
                                stats: stats
                            });
                        } else {
                            // 오늘 기록 없음
                            setDisplayData({ score: 0, stats: { energy: 0, burden: 0, passion: 0 } });
                        }

                        // 히스토리(History) 세팅
                        if (data.statusHistory && data.statusHistory.items) {
                            const items = data.statusHistory.items;
                            setAllHistory(items);

                            // 차트용: 최신 날짜순 정렬 -> 7개 자르기 -> 뒤집기(과거->현재)
                            const sortedItems = [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
                            const recentItems = sortedItems.slice(0, 7).reverse();

                            setHistoryData(recentItems.map(item => ({
                                date: item.date,
                                shortDate: item.date.substring(5),
                                score: calculateTotalScore(item)
                            })));
                        } else {
                            setAllHistory([]);
                            setHistoryData([]);
                        }

                        // 코멘트(Comments) 세팅
                        if (data.receivedComments) {
                            pickRandomComment(data.receivedComments);
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
    // myInfo가 없으면 로딩 실패로 간주
    if (!myInfo) return <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>정보를 불러올 수 없습니다.</div>;

    return (
        <HomeContainer>
            <DashboardHeader
                myInfo={myInfo}
                randomComment={randomComment}
                {...calendar}
                isReadOnly={!isMe} // 남의 홈이면 읽기 전용
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