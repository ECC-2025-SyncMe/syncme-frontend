import styled from '@emotion/styled';
import { theme } from '../styles/theme';

// 전체 화면 컨테이너
export const Container = styled.div`
  display: flex; 
  width: 100vw;       /* 명확한 너비 */
  height: 100vh;      /* 화면 꽉 차게 설정 */
  padding: 20px; 
  gap: 20px; 
  box-sizing: border-box;
  background-color: ${theme.colors.background}; 
  overflow: hidden;   /* 스크롤 방지 */
`;

// 3단 컬럼 (왼쪽, 가운데, 오른쪽)
export const Column = styled.div`
  background: ${theme.colors.panel}; 
  border-radius: 20px; 
  padding: 24px; 
  border: 1px solid ${theme.colors.border};
  display: flex; flex-direction: column; position: relative; height: 100%; box-sizing: border-box;
  
  /* Flex 비율 유지: 디자인 보존의 핵심 */
  &.left { flex: 1; align-items: flex-start; }
  &.center { flex: 1.2; }
  &.right { flex: 1; }

  height: calc(100vh - 40px); /* 패딩 제외 전체 높이 */
  overflow-y: auto;           /* 내용 많으면 내부 스크롤 */
`;