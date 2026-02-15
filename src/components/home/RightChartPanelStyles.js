import styled from '@emotion/styled';
import { theme } from '../../styles/theme';

export const Panel = styled.div`
  background: ${theme.colors.panel}; 
  border-radius: 24px; 
  border: 1px solid ${theme.colors.border};
  padding: 24px; 
  display: flex; 
  flex-direction: column; 
  position: relative; 
  height: 100%; 
  box-sizing: border-box;
`;

export const SectionTitle = styled.h3`
  margin: 0 0 10px 0; 
  color: #ccc; 
  font-size: 1.1rem; 
  font-weight: 600; 
  flex-shrink: 0;

  span {
    font-size: 0.8rem;
    margin-left: 8px;
    color: ${theme.colors.textTertiary};
  }
`;

export const ChartContainer = styled.div`
  flex: 2;
  min-height: 0;
`;

export const ScoreContainer = styled.div`
  flex: 3;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  
  .bar-wrapper {
    flex: 1;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  .bar-box {
    width: 80px;
    height: 100%;
  }

  .score-label {
    margin-top: 15px;
    margin-bottom: 5px;
    font-size: 1rem;
    color: ${theme.colors.text};
    font-weight: bold;
  }
`;

export const Spacer = styled.div`
  height: 20px;
`;