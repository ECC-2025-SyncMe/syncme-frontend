import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

import Button from './components/Button';

import Home from './pages/HomePage';
import Friends from './pages/FriendsPage';
import Setting from './pages/SettingPage';
import Login from './pages/LoginPage';

// 아이콘: FaGamepad로 변경됨
import { FaCompass, FaGamepad, FaUserFriends, FaCog } from 'react-icons/fa';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 페이지인지 확인
  const isLoginPage = location.pathname === '/';

  return (
    <div className="app-container">
      <div className="content-container">
        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/home" element={<Home />} />
          {/* 친구 홈(공유 링크)으로 들어올 때 */}
          <Route path="/home/:userId" element={<Home />} />

          <Route path="/friends" element={<Friends />} />
          <Route path="/setting" element={<Setting />} />
          {/* 업데이트 페이지 라우트가 필요하다면 아래 주석 해제 */}
          {/* <Route path="/update" element={<UpdatePage />} /> */}
        </Routes>
      </div>

      {!isLoginPage && (
        <nav className="nav-bar">
          <Button
            label="HOME"
            icon={<FaCompass />}
            onClick={() => navigate('/home')}
            isActive={location.pathname === '/home'}
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