import React from 'react';
<<<<<<< HEAD
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
=======
import styled from '@emotion/styled';

// 스타일 컴포넌트는 반드시 함수(App) 밖에서 만듭니다!
const StyledButton = styled.button`
  background-color: #646cff;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background-color: #535bf2;
  }
`;

function App() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Emotion 설정 완료! 🎨</h1>
      
      </div>
>>>>>>> 8949830da6b6fd531183eb655cdc5df1d9f6b935
    </div>
  );
}

<<<<<<< HEAD
export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
=======
export default App;
>>>>>>> 8949830da6b6fd531183eb655cdc5df1d9f6b935
