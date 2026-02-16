import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

import Button from './components/Button';

import Login from './pages/LoginPage';
import LoginCallback from './pages/LoginCallback';
import Home from './pages/HomePage';
import Update from './pages/UpdatePage';
import Friends from './pages/FriendsPage';
import Setting from './pages/SettingPage';

// 아이콘: FaGamepad로 변경됨
import { FaCompass, FaGamepad, FaUserFriends, FaCog } from 'react-icons/fa';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 페이지인지 확인
  const isLoginPage = location.pathname === '/' || location.pathname === '/login/callback';

  return (
    <div className="app-container">
      <div className="content-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login/callback" element={<LoginCallback />} />
          <Route path="/home" element={<Home />} />
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
  const googleClientId = '272193164209-rngsfkf55b51i8bigu2cr727l74nih63.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}