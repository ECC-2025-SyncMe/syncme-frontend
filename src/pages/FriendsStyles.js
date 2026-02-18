import styled from '@emotion/styled';
import { theme } from '../styles/theme';

// 전체 화면 컨테이너
export const Container = styled.div`
  display: flex;
  width: 100%;
  height: calc(100vh - 140px); 
  
  /* 여백은 유지 */
  padding: 0 20px; 
  gap: 20px;
  box-sizing: border-box;
  background-color: ${theme.colors.background}; 
  color: ${theme.colors.text};
  
  /* 부모 스크롤바 유발 방지 */
  overflow: hidden; 
`;

// 3단 컬럼 (내부 스크롤 담당)
export const Column = styled.div`
  background: ${theme.colors.panel}; 
  border-radius: 20px; 
  padding: 24px; 
  border: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  position: relative;
  
  height: 100%;
  min-height: 0; 
  
  box-sizing: border-box;
  overflow: hidden;

  &.left { flex: 1; align-items: flex-start; }
  &.center { flex: 1.2; }
  &.right { flex: 1; }
`;