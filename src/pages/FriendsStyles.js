import styled from '@emotion/styled';
import { theme } from '../styles/theme';

// 전체 화면 컨테이너
export const Container = styled.div`
  display: flex; 
  width: 100vw; 
  height: 100vh; 
  padding: 20px 20px 0 20px; 
  gap: 20px; 
  box-sizing: border-box;
  background-color: ${theme.colors.background}; 
  color: ${theme.colors.text};
  overflow: hidden;
`;

// 3단 컬럼 (왼쪽, 가운데, 오른쪽)
export const Column = styled.div`
  background: ${theme.colors.panel}; 
  border-radius: 20px; 
  padding: 24px; 
  border: 1px solid ${theme.colors.border};
  display: flex; 
  flex-direction: column; 
  position: relative; 
  box-sizing: border-box;
  
  height: calc(100vh - 120px); 
  
  overflow-y: auto; /* 내용이 넘치면 컬럼 안에서만 스크롤 */

  /* Flex 비율 유지 */
  &.left { flex: 1; align-items: flex-start; }
  &.center { flex: 1.2; }
  &.right { flex: 1; }
`;