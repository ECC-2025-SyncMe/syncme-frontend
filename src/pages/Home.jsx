import React, { useState, useEffect } from 'react';

// 스타일 및 아이콘 라이브러리
import styled from '@emotion/styled';
import {
    FaCalendarAlt, FaQuoteRight, FaTimes,
    FaBolt, FaFire, FaWeightHanging,
    FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

// 차트 라이브러리 (Recharts)
import {
    LineChart, Line, BarChart, Bar, Cell, LabelList,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

// 목업 데이터 및 유틸
import { MY_INFO, RECORDED_DATES, getDailyData } from '../mocks/mockData';

// --- 상수 및 스타일 정의 ---

const THEME_COLOR = '#A0CEFD';
const ACCENT_COLOR = '#0088DD';

// 전체 레이아웃 컨테이너
const Container = styled.div`
  width: 100%; height: 100%; padding: 30px; box-sizing: border-box;
  background-color: #000000; color: #ffffff;
  display: flex; flex-direction: column;
`;

// 상단 헤더 (타이틀, 날짜 선택, 코멘트)
const Header = styled.div`
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #222;
  flex-shrink: 0; 
`;

const HeaderLeft = styled.div`
  display: flex; align-items: baseline; gap: 20px;
  h1 { margin: 0; font-size: 3.5rem; font-weight: 900; line-height: 1; white-space: nowrap; }
`;

const DateButton = styled.button`
  background: #1a1a1a; border: 1px solid #333; color: #aaa;
  padding: 8px 16px; border-radius: 30px; cursor: pointer;
  display: flex; align-items: center; gap: 8px; font-size: 1rem;
  transition: 0.2s;
  &:hover { border-color: ${THEME_COLOR}; color: ${THEME_COLOR}; }
`;

// 우측 상단 랜덤 코멘트 박스
const RandomCommentBox = styled.div`
  background: #111; border: 1px solid #333; padding: 12px 20px;
  border-radius: 20px 20px 0 20px; 
  display: flex; align-items: center; gap: 15px;
  max-width: 400px;
  
  p { margin: 0; font-size: 0.95rem; color: #eee; word-break: keep-all; }
  .from { font-size: 0.8rem; color: #888; margin-bottom: 4px; }
  svg { color: ${ACCENT_COLOR}; font-size: 1.2rem; flex-shrink: 0; }
`;

// 달력 모달 오버레이
const Overlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.7); z-index: 2000; 
  display: flex; justify-content: center; align-items: center;
`;

const CalendarPopup = styled.div`
  background: #1a1a1a; border: 1px solid #444; border-radius: 20px;
  padding: 25px; width: 400px; 
  box-shadow: 0 10px 40px rgba(0,0,0,0.9);
  position: relative;
  display: flex; flex-direction: column;

  .cal-header-row { 
    display: flex; justify-content: center; align-items: center;
    margin-bottom: 20px; position: relative;
    height: 40px;
  }

  .nav-group {
    display: flex; align-items: center; gap: 10px;
    h3 { margin: 0; font-size: 1.2rem; color: white; white-space: nowrap; }
  }

  .nav-btn { 
    background: none; border: none; color: #888; cursor: pointer; font-size: 1rem;
    display: flex; align-items: center; justify-content: center;
    padding: 5px;
    &:hover { color: ${THEME_COLOR}; }
  }

  .today-btn {
    background: #222; border: 1px solid #444; color: #ccc;
    padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; cursor: pointer;
    transition: 0.2s;
    &:hover { border-color: ${THEME_COLOR}; color: ${THEME_COLOR}; }
  }

  .close-btn {
    position: absolute; right: 0;
    background: none; border: none; 
    color: #666; 
    cursor: pointer; font-size: 1.2rem;
    padding: 5px;
    transition: 0.2s;
    &:hover { color: white; } 
  }

  .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; text-align: center; }
  .day-name { font-size: 0.9rem; color: #666; margin-bottom: 5px; font-weight: bold; }
  
  .day { 
    width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
    border-radius: 50%; font-size: 1rem; cursor: pointer; color: #aaa; transition: 0.2s;
    &:hover { background: #333; color: white; }
    &.recorded { border: 1px solid ${THEME_COLOR}; color: ${THEME_COLOR}; }
    &.selected { background: ${THEME_COLOR}; color: #000; font-weight: bold; border: none; }
  }
`;

// 메인 대시보드 그리드 레이아웃
const Dashboard = styled.div`
  display: grid; 
  grid-template-columns: minmax(220px, 1fr) minmax(300px, 2fr) minmax(220px, 1fr); 
  gap: 20px; flex: 1; height: 100%; min-height: 0;
`;

const Panel = styled.div`
  background: #1a1a1a; border-radius: 24px; border: 1px solid #333;
  padding: 24px; display: flex; flex-direction: column;
  position: relative; height: 100%; box-sizing: border-box;
  &.center { background: #0d0d0d; border: 1px dashed #333; align-items: center; justify-content: center; }
`;

const SectionTitle = styled.h3`
  margin: 0 0 10px 0; color: #ccc; font-size: 1.1rem; font-weight: 600; flex-shrink: 0;
`;

// 상태 아이템 (에너지, 부담감, 열정) 디자인
const StatItem = styled.div`
  width: 100%;
  .label-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .icon { color: ${props => props.color}; font-size: 1.4rem; }
  
  /* 항목 이름: 테마 색상 적용 */
  .name { font-weight: 900; font-size: 1rem; color: ${props => props.color}; flex: 1; letter-spacing: 0.5px; }
  
  /* 퍼센트 값: 회색 처리 */
  .value { font-weight: bold; color: #777; font-size: 0.95rem; }

  .bar-bg { width: 100%; height: 10px; background: #333; border-radius: 5px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 5px; background: ${props => props.color}; transition: width 0.5s ease;}
`;

// 날짜 변환 유틸리티 (YYYY-MM-DD)
const toDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// --- 메인 컴포넌트 ---
export default function Home() {
    // 상태 관리: 달력 표시 여부, 랜덤 코멘트
    const [showCalendar, setShowCalendar] = useState(false);
    const [randomComment, setRandomComment] = useState("");

    // 상태 관리: 선택된 날짜 및 달력 뷰 기준 날짜
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date());

    // 상태 관리: 화면 표시 데이터 및 그래프 데이터
    const [displayData, setDisplayData] = useState(null);
    const [historyData, setHistoryData] = useState([]);

    // 데이터 업데이트 로직 (선택된 날짜 기준)
    const updateDashboard = (targetDate) => {
        const targetStr = toDateStr(targetDate);
        const isRecorded = RECORDED_DATES.includes(targetStr);

        // 기록이 있으면 데이터 로드, 없으면 0점 처리
        if (isRecorded) {
            setDisplayData(getDailyData(targetStr));
        } else {
            setDisplayData({
                score: 0,
                stats: { energy: 0, burden: 0, passion: 0 }
            });
        }

        // 최근 4일간(오늘 포함)의 그래프 데이터 생성
        const newHistory = [];
        for (let i = 3; i >= 0; i--) {
            const d = new Date(targetDate);
            d.setDate(targetDate.getDate() - i);

            const dStr = toDateStr(d);
            const hasRecord = RECORDED_DATES.includes(dStr);

            const score = hasRecord ? getDailyData(dStr).score : 0;

            newHistory.push({
                date: `${d.getMonth() + 1}-${d.getDate()}`,
                score: score,
                fullDate: dStr
            });
        }
        setHistoryData(newHistory);
    };

    // 초기 렌더링 시 오늘 날짜 데이터 및 랜덤 코멘트 설정
    useEffect(() => {
        updateDashboard(new Date());

        if (MY_INFO.comments?.length > 0) {
            setRandomComment(MY_INFO.comments[Math.floor(Math.random() * MY_INFO.comments.length)]);
        } else {
            setRandomComment({ writer: "알림", text: "응원 메시지가 없어요!" });
        }
    }, []);

    // 달력 조작 핸들러
    const openCalendar = () => {
        setViewDate(selectedDate);
        setShowCalendar(true);
    };

    const goToToday = () => {
        const today = new Date();
        setSelectedDate(today);
        setViewDate(today);
        updateDashboard(today);
        setShowCalendar(false);
    };

    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const handleDateClick = (y, m, d) => {
        const newDate = new Date(y, m, d);
        setSelectedDate(newDate);
        updateDashboard(newDate);
        setShowCalendar(false);
    };

    // 달력 날짜 렌더링 헬퍼
    const renderCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];

        // 빈 날짜 채우기
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

        // 실제 날짜 채우기
        for (let i = 1; i <= daysInMonth; i++) {
            const isRecorded = RECORDED_DATES.includes(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
            const isSelected =
                i === selectedDate.getDate() &&
                month === selectedDate.getMonth() &&
                year === selectedDate.getFullYear();

            days.push(
                <div key={i} className={`day ${isSelected ? 'selected' : ''} ${isRecorded ? 'recorded' : ''}`}
                    onClick={() => handleDateClick(year, month, i)}>
                    {i}
                </div>
            );
        }
        return days;
    };

    if (!displayData) return null;

    const barData = [{ name: 'Score', value: displayData.score }];

    return (
        <Container>
            {/* 상단 헤더 영역 */}
            <Header>
                <HeaderLeft>
                    <h1>{MY_INFO.nickname}</h1>
                    <DateButton onClick={openCalendar}>
                        <FaCalendarAlt /> {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
                    </DateButton>
                </HeaderLeft>
                <RandomCommentBox>
                    <FaQuoteRight />
                    <div>
                        <p className="from">From. {randomComment.writer}</p>
                        <p>{randomComment.text}</p>
                    </div>
                </RandomCommentBox>
            </Header>

            {/* 달력 팝업 (조건부 렌더링) */}
            {showCalendar && (
                <Overlay onClick={() => setShowCalendar(false)}>
                    <CalendarPopup onClick={e => e.stopPropagation()}>
                        <div className="cal-header-row">
                            <div className="nav-group">
                                <button className="nav-btn" onClick={prevMonth}><FaChevronLeft /></button>
                                <h3>{viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월</h3>
                                <button className="today-btn" onClick={goToToday}>Today</button>
                                <button className="nav-btn" onClick={nextMonth}><FaChevronRight /></button>
                            </div>
                            <button className="close-btn" onClick={() => setShowCalendar(false)} title="닫기">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="grid">
                            {['일', '월', '화', '수', '목', '금', '토'].map(d => <span key={d} className="day-name">{d}</span>)}
                            {renderCalendarDays()}
                        </div>
                    </CalendarPopup>
                </Overlay>
            )}

            {/* 메인 대시보드 패널 영역 */}
            <Dashboard>

                {/* 왼쪽 패널: 오늘의 상태 (에너지, 부담감, 열정) */}
                <Panel>
                    <SectionTitle>오늘의 상태 <span>Status</span></SectionTitle>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                        <StatItem color="#F3E524">
                            <div className="label-row"><FaBolt className="icon" /><span className="name">ENERGY</span><span className="value">{displayData.stats.energy}%</span></div>
                            <div className="bar-bg"><div className="bar-fill" style={{ width: `${displayData.stats.energy}%` }}></div></div>
                        </StatItem>
                        <StatItem color="#C23B21">
                            <div className="label-row"><FaWeightHanging className="icon" /><span className="name">PRESSURE</span><span className="value">{displayData.stats.burden}%</span></div>
                            <div className="bar-bg"><div className="bar-fill" style={{ width: `${displayData.stats.burden}%` }}></div></div>
                        </StatItem>
                        <StatItem color="#FF8B01">
                            <div className="label-row"><FaFire className="icon" /><span className="name">PASSION</span><span className="value">{displayData.stats.passion}%</span></div>
                            <div className="bar-bg"><div className="bar-fill" style={{ width: `${displayData.stats.passion}%` }}></div></div>
                        </StatItem>
                    </div>
                </Panel>

                {/* 중앙 패널: 3D 캐릭터 뷰어 */}
                <Panel className="center">
                    <h2 style={{ color: '#333' }}>3D CHARACTER</h2>
                </Panel>

                {/* 오른쪽 패널: 트렌드 그래프 및 스코어 */}
                <Panel>
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* 최근 점수 변화 그래프 (Line Chart) */}
                        <div style={{ flex: 2, minHeight: 0 }}>
                            <SectionTitle>최근 점수 변화 <span>Recent Score Changes</span></SectionTitle>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={historyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="date" stroke="#666" tickLine={false} tick={{ fontSize: 11 }} interval={0} />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #888' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#828282"
                                        strokeWidth={3}
                                        dot={{ r: 3, fill: '#828282', stroke: '#fff' }}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ height: '20px' }}></div>

                        {/* 오늘의 점수 바 그래프 (Bar Chart) */}
                        <div style={{ flex: 3, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <div style={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <div style={{ width: '80px', height: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData} margin={{ top: 0, bottom: 0 }}>
                                            <YAxis hide domain={[0, 100]} />
                                            <Bar dataKey="value" radius={[15, 15, 0, 0]} barSize={60} isAnimationActive={true}>
                                                <Cell fill={ACCENT_COLOR} />
                                                <LabelList
                                                    dataKey="value" position="insideTop" fill="#ffffff" fontWeight="bold" fontSize={20} dy={10}
                                                />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <p style={{ marginTop: '15px', marginBottom: '5px', fontSize: '1rem', color: '#ffffff', fontWeight: 'bold' }}>Score</p>
                        </div>
                    </div>
                </Panel>
            </Dashboard>
        </Container>
    );
}