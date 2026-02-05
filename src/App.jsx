import React from 'react';
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
    </div>
  );
}

export default App;
