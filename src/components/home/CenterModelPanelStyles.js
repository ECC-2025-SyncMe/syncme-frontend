import styled from '@emotion/styled';
import { theme } from '../../styles/theme';

export const CenterPanel = styled.div`
  background: #0d0d0d; 
  border-radius: 24px; 
  border: 1px dashed ${theme.colors.border};
  padding: 24px; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center;
  position: relative; 
  height: 100%; 
  box-sizing: border-box;

  h2 {
    color: ${theme.colors.border}; /* #333 대신 테마 border 색상 사용 or textTertiary */
    font-weight: bold;
  }
`;