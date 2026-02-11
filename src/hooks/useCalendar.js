import { useState } from 'react';

export function useCalendar(updateDashboard) {
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date());

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

    const prevMonth = () =>
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

    const nextMonth = () =>
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const handleDateClick = (y, m, d) => {
        const newDate = new Date(y, m, d);
        setSelectedDate(newDate);
        updateDashboard(newDate);
        setShowCalendar(false);
    };

    const closeCalendar = () => {
        setShowCalendar(false);
    };

    return {
        showCalendar,
        selectedDate,
        viewDate,
        openCalendar,
        closeCalendar,
        goToToday,
        prevMonth,
        nextMonth,
        handleDateClick,
    };
}