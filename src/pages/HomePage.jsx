import React, { useState, useEffect } from 'react';
import { MY_INFO, RECORDED_DATES, getDailyData } from '../mocks/mockData';

// 공통 훅 & 유틸
import { useCalendar } from '../hooks/useCalendar';
import { toDateStr } from '../utils/dateUtils';

// 분리된 스타일
import { HomeContainer, DashboardGrid } from './HomeStyles';

// 하위 컴포넌트
import DashboardHeader from '../components/home/DashboardHeader';
import LeftStatPanel from '../components/home/LeftStatPanel';
import CenterModelPanel from '../components/home/CenterModelPanel';
import RightChartPanel from '../components/home/RightChartPanel';

export default function Home() {
    const [displayData, setDisplayData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [randomComment, setRandomComment] = useState("");

    const updateDashboard = (targetDate) => {
        const targetStr = toDateStr(targetDate); // util 함수 사용
        const isRecorded = RECORDED_DATES.includes(targetStr);

        if (isRecorded) {
            setDisplayData(getDailyData(targetStr));
        } else {
            setDisplayData({
                score: 0,
                stats: { energy: 0, burden: 0, passion: 0 }
            });
        }

        const newHistory = [];
        for (let i = 3; i >= 0; i--) {
            const d = new Date(targetDate);
            d.setDate(targetDate.getDate() - i);
            const dStr = toDateStr(d); // util 함수 사용
            const hasRecord = RECORDED_DATES.includes(dStr);
            newHistory.push({
                date: `${d.getMonth() + 1}-${d.getDate()}`,
                score: hasRecord ? getDailyData(dStr).score : 0,
            });
        }
        setHistoryData(newHistory);
    };

    // --- Custom Hook 사용 ---
    const calendar = useCalendar(updateDashboard);

    useEffect(() => {
        updateDashboard(new Date());
        if (MY_INFO.comments?.length > 0) {
            setRandomComment(MY_INFO.comments[Math.floor(Math.random() * MY_INFO.comments.length)]);
        } else {
            setRandomComment({ writer: "알림", text: "응원 메시지가 없어요!" });
        }
    }, []);

    if (!displayData) return null;

    // --- View (JSX) ---
    return (
        <HomeContainer>
            <DashboardHeader
                myInfo={MY_INFO}
                randomComment={randomComment}
                {...calendar}
            />

            <DashboardGrid>
                <LeftStatPanel stats={displayData.stats} />
                <CenterModelPanel />
                <RightChartPanel historyData={historyData} score={displayData.score} />
            </DashboardGrid>
        </HomeContainer>
    );
}