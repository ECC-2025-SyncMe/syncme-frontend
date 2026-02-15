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
    const { userId } = useParams(); //URL 파라미터 가져오기
    const isMe = !userId; // userId가 없으면 내 홈, 있으면 친구 홈

    const [myInfo, setMyInfo] = useState(null);
    const [displayData, setDisplayData] = useState({
        score: 0,
        stats: { energy: 0, burden: 0, passion: 0 }
    });
    const [historyData, setHistoryData] = useState([]);
    const [randomComment, setRandomComment] = useState({ writer: "SyncMe", text: "오늘 하루도 힘내세요!" });
    const [loading, setLoading] = useState(true);

    // 날짜가 바뀔 때 실행될 함수
    const updateDashboard = async (targetDate) => {
        // 친구 홈일 때는 날짜 변경 기능을 일단 제한하거나 오늘 데이터만 고정
        if (!isMe) return;

        const targetStr = toDateStr(targetDate);
        const todayStr = toDateStr(new Date());

        if (targetStr !== todayStr) {
            setDisplayData({ score: 0, stats: { energy: 0, burden: 0, passion: 0 } });
            return;
        }

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
            console.error("상태 불러오기 실패:", error);
            setDisplayData({ score: 0, stats: { energy: 0, burden: 0, passion: 0 } });
        }
    };

    const calendar = useCalendar(updateDashboard);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                let userData;
                let statusData;

                if (isMe) {
                    // --- 내 홈 정보 가져오기 ---
                    const userRes = await api.get('/users/me');
                    const statusRes = await api.get('/status/today');
                    userData = userRes.data.data;
                    statusData = statusRes.data.data;
                } else {
                    // --- 공유된 친구 홈 정보 가져오기 (GET /home/{userId}) ---
                    const friendRes = await api.get(`/home/${userId}`);
                    // 백엔드 명세에 따라 friendRes.data.data 안에 
                    // 유저 정보와 상태 정보가 같이 들어있을 것으로 가정합니다.
                    userData = friendRes.data.data.user || friendRes.data.data;
                    statusData = friendRes.data.data.status || friendRes.data.data;
                }

                if (userData) {
                    setMyInfo(userData);
                    const comments = userData.comments || [];
                    if (comments.length > 0) {
                        const randomIdx = Math.floor(Math.random() * comments.length);
                        setRandomComment(comments[randomIdx]);
                    }
                }

                if (statusData) {
                    setDisplayData({
                        score: statusData.totalScore || statusData.score || 0,
                        stats: {
                            energy: statusData.energy || 0,
                            burden: statusData.burden || 0,
                            passion: statusData.passion || 0
                        }
                    });
                }

                // 차트 데이터 초기화 (임시)
                setHistoryData([
                    { date: '3일전', score: 0 },
                    { date: '2일전', score: 0 },
                    { date: '1일전', score: 0 },
                    { date: '오늘', score: statusData?.totalScore || 0 }
                ]);

            } catch (error) {
                console.error("데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [userId, isMe]); // userId가 바뀌면 다시 로드

    if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: '#fff' }}>데이터 불러오는 중...</div>;
    if (!myInfo) return <div style={{ padding: '20px', textAlign: 'center', color: '#fff' }}>사용자를 찾을 수 없습니다.</div>;

    return (
        <HomeContainer>
            <DashboardHeader
                myInfo={myInfo}
                randomComment={randomComment}
                {...calendar}
                // 친구 홈일 때는 날짜 조절 UI를 숨기거나 읽기 전용으로 처리하도록 props 전달 가능
                isReadOnly={!isMe}
            />

            <DashboardGrid>
                <LeftStatPanel stats={displayData.stats} />
                <CenterModelPanel />
                <RightChartPanel historyData={historyData} score={displayData.score} />
            </DashboardGrid>
        </HomeContainer>
    );
}