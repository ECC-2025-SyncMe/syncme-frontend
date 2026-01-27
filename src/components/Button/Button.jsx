// home, status, settings 버튼에 사용되는 공통 버튼 컴포넌트
import React from 'react';
import './button.css';

const Button = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      className={`nav-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="button-icon">{icon}</div>
      <span className="button-label">{label.toUpperCase()}</span>
    </button>
  );
};

export default Button;
