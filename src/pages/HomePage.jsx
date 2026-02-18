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
    const { userId } = useParams(); // URL에 userId가 있으면 친구 홈, 없으면 내 홈
    const location = useLocation();
    const isMe = !userId;

    const [myInfo, setMyInfo] = useState(null);

    // 화면에 표시할 점수와 통계 (기본값 0)
    const [displayData, setDisplayData] = useState({
        score: 0,
        stats: { energy: 0, burden: 0, passion: 0 }
    });

    const [allHistory, setAllHistory] = useState([]);
    const [historyData, setHistoryData] = useState([]);

    // 한 줄 응원 기본값
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

    /**
     * 댓글 목록에서 랜덤으로 하나 뽑는 함수
     */
    const pickRandomComment = (comments) => {
        if (!comments || comments.length === 0) return;

        const randomIndex = Math.floor(Math.random() * comments.length);
        const picked = comments[randomIndex];

        setRandomComment({
            writer: picked.authorNickname || picked.writer || '익명',
            text: picked.content || picked.text || '내용 없음'
        });
    };

    /**
     * 날짜 클릭 시 대시보드 업데이트 로직 (달력 기능)
     * - 내 홈일 때만 작동
     */
    const updateDashboard = async (targetDate) => {
        if (!isMe) return;

        const targetStr = toDateStr(targetDate);
        const todayStr = toDateStr(new Date());

        // 오늘 날짜를 클릭했다면 서버에서 최신 상태를 다시 가져옴 (싱크 맞춤)
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

        // 과거 날짜는 히스토리 배열에서 찾아서 표시
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

    // 초기 데이터 로드
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                if (isMe) {
                    // ==========================================
                    // [내 홈] 로직
                    // ==========================================
                    const [userRes, statusRes, historyRes, commentsRes] = await Promise.allSettled([
                        api.get('/users/me'),
                        api.get('/status/today'),
                        api.get('/status/history'),
                        api.get('/comments/received')
                    ]);

                    // 유저 정보
                    if (userRes.status === 'fulfilled' && userRes.value.data.success) {
                        setMyInfo(userRes.value.data.data);
                    }

                    // 오늘 상태
                    let todayStats = { energy: 0, burden: 0, passion: 0 };
                    let todayScore = 0;

                    if (statusRes.status === 'fulfilled' && statusRes.value.data.success && statusRes.value.data.data) {
                        const todayData = statusRes.value.data.data;
                        todayStats = {
                            energy: todayData.energy || 0,
                            burden: todayData.burden || todayData.pressure || 0,
                            passion: todayData.passion || 0
                        };
                        todayScore = todayData.totalScore || calculateTotalScore(todayStats);

                        setDisplayData({ score: todayScore, stats: todayStats });
                    }

                    // 히스토리 및 차트
                    if (historyRes.status === 'fulfilled' && historyRes.value.data.success) {
                        let items = historyRes.value.data.data.items || [];
                        const todayStr = toDateStr(new Date());

                        // 오늘 기록이 히스토리에 아직 안 들어갔다면(서버 지연 등) 수동 추가
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
                    }

                    // 방명록 (한 줄 응원)
                    if (commentsRes.status === 'fulfilled' && commentsRes.value.data.success) {
                        pickRandomComment(commentsRes.value.data.data);
                    }

                } else {
                    // ==========================================
                    // [친구 홈 / 공유 링크] 로직
                    // ==========================================
                    const [friendRes, commentsRes] = await Promise.allSettled([
                        api.get(`/home/${userId}`),
                        api.get(`/friends/${userId}/comments`)
                    ]);

                    if (friendRes.status === 'fulfilled' && friendRes.value.data.success) {
                        const resData = friendRes.value.data.data; // friendRes 안에 {user, status, history} 포함됨

                        if (resData) {
                            setMyInfo(resData.user || resData);

                            // status 필드가 없으면 history에서 오늘 날짜를 찾아서 채움
                            let status = resData.status;
                            const todayStr = toDateStr(new Date());

                            if (!status && Array.isArray(resData.history)) {
                                status = resData.history.find(h => h.date === todayStr);
                            }

                            // 찾은 status로 통계 설정
                            const stats = {
                                energy: status?.energy || 0,
                                burden: status?.burden || status?.pressure || 0,
                                passion: status?.passion || 0
                            };

                            setDisplayData({
                                score: status ? (status.totalScore || calculateTotalScore(stats)) : 0,
                                stats: stats
                            });

                            // 히스토리 및 차트 설정
                            const historyItems = (resData.history && resData.history.length > 0)
                                ? resData.history
                                : (status ? [status] : []);

                            // 날짜순 정렬
                            historyItems.sort((a, b) => new Date(a.date) - new Date(b.date));
                            setAllHistory(historyItems);

                            const chartData = historyItems.slice(-7).map(item => ({
                                date: item.date,
                                shortDate: item.date ? item.date.substring(5) : 'Today',
                                score: calculateTotalScore(item)
                            }));
                            setHistoryData(chartData);
                        }
                    }

                    // 친구 방명록 랜덤 표시
                    if (commentsRes.status === 'fulfilled' && commentsRes.value.data.success) {
                        pickRandomComment(commentsRes.value.data.data);
                    }
                }
            } catch (error) {
                console.error("데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [userId, isMe, location.key]); // 페이지 이동 시 재실행

    if (loading) return <div style={{ color: '#fff', padding: '20px' }}>로딩 중...</div>;
    if (!myInfo) return <div style={{ color: '#fff', padding: '20px' }}>유저 정보를 찾을 수 없습니다.</div>;

    return (
        <HomeContainer>
            <DashboardHeader
                myInfo={myInfo}
                randomComment={randomComment}
                {...calendar}
                isReadOnly={!isMe} // 남의 홈이면 달력 조작 불가
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