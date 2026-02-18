import styled from '@emotion/styled';
import { theme } from '../styles/theme';

// 전체 화면 컨테이너
export const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%; /* 부모 영역 꽉 채우기 */
  
  /* [핵심] 자연스러운 간격 조정 */
  /* 상단: 50px (너무 붙지 않게) */
  /* 하단: 100px (내비바 가려지지 않게 공간 확보) */
  /* 좌우: 20px */
  padding: 50px 20px 100px 20px; 
  
  gap: 20px;
  box-sizing: border-box;
  background-color: ${theme.colors.background}; 
  color: ${theme.colors.text};
  
  overflow: hidden; /* 여기도 스크롤 금지 */
`;

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
  overflow: hidden; /* 자식에게 스크롤 위임 */

  /* Flex 비율 */
  &.left { flex: 1; align-items: flex-start; }
  &.center { flex: 1.2; }
  &.right { flex: 1; }
`;