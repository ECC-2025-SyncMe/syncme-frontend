import React from 'react';
import { FaCalendarAlt, FaQuoteRight, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { RECORDED_DATES } from '../../mocks/mockData';

import {
    Header, HeaderLeft, DateButton, RandomCommentBox,
    Overlay, CalendarPopup
} from './DashboardHeaderStyles';

export default function DashboardHeader({
    myInfo,
    randomComment,
    // Hook Props
    showCalendar,
    selectedDate,
    viewDate,
    openCalendar,
    closeCalendar,
    goToToday,
    prevMonth,
    nextMonth,
    handleDateClick
}) {

    const renderCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];

        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);
        for (let i = 1; i <= daysInMonth; i++) {
            // className을 통해 위에서 정의한 style(theme)이 적용
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isRecorded = RECORDED_DATES.includes(dateStr);
            const isSelected = i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();

            days.push(
                <div key={i} className={`day ${isSelected ? 'selected' : ''} ${isRecorded ? 'recorded' : ''}`}
                    onClick={() => handleDateClick(year, month, i)}>
                    {i}
                </div>
            );
        }
        return days;
    };

    return (
        <>
            <Header>
                <HeaderLeft>
                    <h1>{myInfo.nickname}</h1>
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

            {showCalendar && (
                <Overlay onClick={closeCalendar}>
                    <CalendarPopup onClick={e => e.stopPropagation()}>
                        <div className="cal-header-row">
                            <div className="nav-group">
                                <button className="nav-btn" onClick={prevMonth}><FaChevronLeft /></button>
                                <h3>{viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월</h3>
                                <button className="today-btn" onClick={goToToday}>Today</button>
                                <button className="nav-btn" onClick={nextMonth}><FaChevronRight /></button>
                            </div>
                            <button className="close-btn" onClick={closeCalendar} title="닫기"><FaTimes /></button>
                        </div>
                        <div className="grid">
                            {['일', '월', '화', '수', '목', '금', '토'].map(d => <span key={d} className="day-name">{d}</span>)}
                            {renderCalendarDays()}
                        </div>
                    </CalendarPopup>
                </Overlay>
            )}
        </>
    );
}