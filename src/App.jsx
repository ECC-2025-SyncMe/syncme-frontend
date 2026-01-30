import React from 'react';
import Button from './components/Button';

import DiscoveryIcon from './assets/Discovery.svg';
import UpdateIcon from './assets/Update.svg';
import FriendsIcon from './assets/Friends.svg';
import SettingsIcon from './assets/Settings.svg';

function App() {
  const handleButtonClick = (label) => {
    console.log(`${label} 버튼이 클릭되었습니다.`);
  };

  return (
    <div className="app-container">
      <nav className="nav-bar">
        <Button
          label="HOME"
          icon={DiscoveryIcon}
          onClick={() => handleButtonClick('HOME')}
        />
        <Button
          label="UPDATE"
          icon={UpdateIcon}
          onClick={() => handleButtonClick('UPDATE')}
        />
        <Button
          label="FRIENDS"
          icon={FriendsIcon}
          onClick={() => handleButtonClick('FRIENDS')}
        />
        <Button
          label="SETTINGS"
          icon={SettingsIcon}
          onClick={() => handleButtonClick('SETTINGS')}
        />
      </nav>
    </div>
  );
}

export default App;
