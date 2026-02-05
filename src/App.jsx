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
      <p>가이드라인에 따라 스타일링 도구가 잘 설치되었습니다.</p>

      {/* 우리가 위에서 만든 버튼을 여기서 씁니다 */}
      <StyledButton>색깔 변하는 버튼</StyledButton>

      <div style={{ marginTop: '20px', color: '#666' }}>
        <p>이제 4번 단계: 폴더 구조를 만들 차례입니다!</p>
      </div>
    </div>
  );
}

export default App;