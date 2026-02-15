import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

import Button from './components/Button';

import Login from './pages/LoginPage';
import Home from './pages/HomePage';
import Update from './pages/UpdatePage';
import Friends from './pages/FriendsPage';
import Setting from './pages/SettingPage';

// 아이콘: FaGamepad로 변경됨
import { FaCompass, FaGamepad, FaUserFriends, FaCog } from 'react-icons/fa';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === '/';

  return (
    <div className="app-container">
      <div className="content-container">
        <Routes>
          <Route path="/" element={<Login />} />

          {/* 기본 홈 */}
          <Route path="/home" element={<Home />} />
          {/* 친구/공유 홈: userId 파라미터를 동적으로 받음 */}
          <Route path="/home/:userId" element={<Home />} />

          <Route path="/update" element={<Update />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/setting" element={<Setting />} />
        </Routes>
      </div>

      {!isLoginPage && (
        <nav className="nav-bar">
          <Button
            label="HOME"
            icon={<FaCompass />}
            onClick={() => navigate('/home')}
            // [수정 부분] /home으로 시작하면 활성화 표시
            isActive={location.pathname.startsWith('/home')}
          />
          <Button
            label="UPDATE"
            icon={<FaGamepad />}
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
      )}
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