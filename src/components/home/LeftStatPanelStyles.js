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
  color: #ccc; /* 혹은 theme.colors.textSecondary */
  font-size: 1.1rem; 
  font-weight: 600; 
  flex-shrink: 0;
  
  span {
    font-size: 0.8rem;
    margin-left: 8px;
    color: ${theme.colors.textTertiary};
  }
`;

export const StatList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
`;

export const StatItemContainer = styled.div`
  width: 100%;
  
  .label-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .icon { color: ${props => props.color}; font-size: 1.4rem; }
  .name { font-weight: 900; font-size: 1rem; color: ${props => props.color}; flex: 1; letter-spacing: 0.5px; }
  .value { font-weight: bold; color: #777; font-size: 0.95rem; }
  
  .bar-bg { 
    width: 100%; height: 10px; 
    background: #333; 
    border-radius: 5px; 
    overflow: hidden; 
  }
  
  .bar-fill { 
    height: 100%; 
    border-radius: 5px; 
    background: ${props => props.color}; 
    transition: width 0.5s ease;
  }
`;