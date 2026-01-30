// home, status, settings 버튼에 사용되는 공통 버튼 컴포넌트
import React from 'react';
import './button.css';

const Button = ({ label, icon, onClick }) => {
  return (
    <button className="custom-button" onClick={onClick}>
      {icon && (
        <span className="button-icon">
          {typeof icon === 'string' ? (
            <img
              src={icon}
              alt={label}
              style={{ width: '20px', height: '20px' }}
            />
          ) : (
            icon
          )}
        </span>
      )}
      <span className="button-label">{label}</span>
    </button>
  );
};

export default Button;
