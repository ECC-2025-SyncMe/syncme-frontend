import React from 'react';
import './App.css';
import Button from './components/Button';

import DiscoveryIcon from './assets/Discovery.svg';
import UpdateIcon from './assets/Update.svg';
import FriendsIcon from './assets/Friends.svg';
import SettingsIcon from './assets/Settings.svg';

import Setting from './pages/Setting';
import Update from './pages/UpdatePage';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

function AppLayout() {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <nav className="nav-bar">
        <Button
          label="HOME"
          icon={DiscoveryIcon}
          onClick={() => navigate('/home')}
        />
        <Button
          label="UPDATE"
          icon={UpdateIcon}
          onClick={() => navigate('/update')}
        />
        <Button
          label="FRIENDS"
          icon={FriendsIcon}
          onClick={() => navigate('/friends')}
        />
        <Button
          label="SETTINGS"
          icon={SettingsIcon}
          onClick={() => navigate('/setting')}
        />
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/update" element={<Update />} />
      </Routes>
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
