import styled from '@emotion/styled';
import { theme } from '../styles/theme';

export const HomeContainer = styled.div`
  width: 100%; height: 100%; padding: 30px; box-sizing: border-box;
  background-color: ${theme.colors.background}; 
  color: ${theme.colors.text};
  display: flex; flex-direction: column;
`;

export const DashboardGrid = styled.div`
  display: grid; 
  grid-template-columns: minmax(220px, 1fr) minmax(300px, 2fr) minmax(220px, 1fr); 
  gap: 20px; flex: 1; height: 100%; min-height: 0;
`;