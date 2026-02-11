import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

import Button from './components/Button';

import Home from './pages/HomePage';
import Friends from './pages/FriendsPage';
import Setting from './pages/SettingPage';
import Login from './pages/LoginPage';

// --- 아이콘 (react-icons 사용) ---
// FaCompass(나침반/홈), FaSyncAlt(업데이트/새로고침), FaUserFriends(친구), FaCog(설정)
import { FaCompass, FaSyncAlt, FaUserFriends, FaCog } from 'react-icons/fa';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-container">
      <div className="content-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/setting" element={<Setting />} />
        </Routes>
      </div>

      <nav className="nav-bar">
        <Button
          label="HOME"
          icon={<FaCompass />}
          onClick={() => navigate('/home')}
          isActive={location.pathname === '/home'}
        />
        <Button
          label="UPDATE"
          icon={<FaSyncAlt />}
          onClick={() => navigate('/update')}
          isActive={location.pathname === '/update'}
        />
        <Button
          label="FRIENDS"
          icon={<FaUserFriends />}
          onClick={() => navigate('/friends')}
          isActive={location.pathname === '/friends'}
        />
        <Button
          label="SETTINGS"
          icon={<FaCog />}
          onClick={() => navigate('/setting')}
          isActive={location.pathname === '/setting'}
        />
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}