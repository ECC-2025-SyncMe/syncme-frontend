import React, { useState } from 'react';
import './App.css';
import Button from './components/Button';

function App() {
  const [activeIndex, setActiveIndex] = useState('HOME');

  return (
    <div className="app-container">
      <nav className="nav-bar">
        <Button
          label="HOME"
          icon="🏠"
          isActive={activeIndex === 'HOME'}
          onClick={() => setActiveIndex('HOME')}
        />
        <Button
          label="STATUS"
          icon="✏️"
          isActive={activeIndex === 'STATUS'}
          onClick={() => setActiveIndex('STATUS')}
        />
        <Button
          label="SYSTEM"
          icon="⚙️"
          isActive={activeIndex === 'SYSTEM'}
          onClick={() => setActiveIndex('SYSTEM')}
        />
      </nav>
    </div>
  );
}

export default App;
