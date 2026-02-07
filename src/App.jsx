import React, { useState } from 'react';
import styled from '@emotion/styled';
import { FaCompass, FaGamepad, FaUserFriends, FaCog } from 'react-icons/fa';

import Home from './pages/Home';
import Friends from './pages/Friends';
// 임시 버튼. 공통 버튼 수정 완료시 교체 예정
// --- STYLED COMPONENTS ---
const AppContainer = styled.div`
  width: 100vw; height: 100vh;
  background-color: #000000;
  display: flex; flex-direction: column;
  overflow: hidden; box-sizing: border-box;
`;

const ContentArea = styled.div`
  flex: 1; width: 100%; height: 100%;
  overflow: hidden; position: relative;
`;

const NavBar = styled.nav`
  height: 80px; 
  background-color: #000000; 
  display: flex; justify-content: space-around; align-items: center;
  flex-shrink: 0; z-index: 1000; width: 100%;
  padding: 0 20px; box-sizing: border-box;
`;

const NavButton = styled.button`
  background: ${props => props.active ? '#A0CEFD' : 'none'}; 
  border: none;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 12px; 
  transition: 0.2s;
  min-width: 80px;

  /* 변경: 활성화 상태일 때 글자/아이콘 색상을 흰색(#ffffff)으로 변경 */
  color: ${props => props.active ? '#ffffff' : '#666666'}; 
  
  svg { font-size: 1.4rem; }
  span { 
    font-size: 0.9rem; font-weight: bold; 
    display: ${props => props.active ? 'inline' : 'block'}; 
  }
  
  @media (max-width: 500px) {
    span { display: ${props => props.active ? 'inline' : 'none'}; }
  }

  &:hover {
    color: ${props => props.active ? '#ffffff' : '#A0CEFD'};
  }
`;

// 임시 페이지
const PlaceholderPage = ({ title, icon }) => (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#666' }}>
    <div style={{ fontSize: '3rem', marginBottom: '20px', color: '#333' }}>{icon}</div>
    <h2 style={{ color: '#fff' }}>{title}</h2>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('HOME');

  return (
    <AppContainer>
      <ContentArea>
        {activeTab === 'HOME' && <Home />}
        {activeTab === 'FRIENDS' && <Friends />}
        {activeTab === 'UPDATE' && <PlaceholderPage title="Update" icon={<FaGamepad />} />}
        {activeTab === 'SETTINGS' && <PlaceholderPage title="Settings" icon={<FaCog />} />}
      </ContentArea>

      <NavBar>
        <NavButton active={activeTab === 'HOME'} onClick={() => setActiveTab('HOME')}>
          <FaCompass /><span>Home</span>
        </NavButton>
        <NavButton active={activeTab === 'UPDATE'} onClick={() => setActiveTab('UPDATE')}>
          <FaGamepad /><span>Update</span>
        </NavButton>
        <NavButton active={activeTab === 'FRIENDS'} onClick={() => setActiveTab('FRIENDS')}>
          <FaUserFriends /><span>Friends</span>
        </NavButton>
        <NavButton active={activeTab === 'SETTINGS'} onClick={() => setActiveTab('SETTINGS')}>
          <FaCog /><span>Settings</span>
        </NavButton>
      </NavBar>
    </AppContainer>
  );
}

export default App;