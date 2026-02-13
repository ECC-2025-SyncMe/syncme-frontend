import styled from '@emotion/styled';
import { theme } from '../../styles/theme';

export const Header = styled.div`
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid ${theme.colors.border}; flex-shrink: 0; 
`;

export const HeaderLeft = styled.div`
  display: flex; align-items: baseline; gap: 20px;
  h1 { margin: 0; font-size: 3.5rem; font-weight: 900; line-height: 1; white-space: nowrap; }
`;

export const DateButton = styled.button`
  background: ${theme.colors.panel}; border: 1px solid ${theme.colors.border}; color: ${theme.colors.textSecondary};
  padding: 8px 16px; border-radius: 30px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 1rem; transition: 0.2s;
  min-width: 160px; /* 고정 너비 적용 */
  
  &:hover { border-color: ${theme.colors.secondary}; color: ${theme.colors.secondary}; }
`;

export const RandomCommentBox = styled.div`
  background: #111; border: 1px solid ${theme.colors.border}; padding: 12px 20px; border-radius: 20px 20px 0 20px; 
  display: flex; align-items: center; gap: 15px; max-width: 400px;
  p { margin: 0; font-size: 0.95rem; color: #eee; word-break: keep-all; }
  .from { font-size: 0.8rem; color: #888; margin-bottom: 4px; }
  svg { color: ${theme.colors.primary}; font-size: 1.2rem; flex-shrink: 0; }
`;

export const Overlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.7); z-index: 2000; 
  display: flex; justify-content: center; align-items: center;
`;

export const CalendarPopup = styled.div`
  background: ${theme.colors.panel}; border: 1px solid #444; border-radius: 20px; padding: 25px; width: 400px; 
  box-shadow: 0 10px 40px rgba(0,0,0,0.9); position: relative; display: flex; flex-direction: column;

  .cal-header-row { display: flex; justify-content: center; align-items: center; margin-bottom: 20px; position: relative; height: 40px; }
  
  .nav-group { display: flex; align-items: center; gap: 10px; 
    h3 { margin: 0; font-size: 1.2rem; color: white; white-space: nowrap; width: 140px; text-align: center; } 
  }

  .nav-btn { background: none; border: none; color: #888; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; padding: 5px; &:hover { color: ${theme.colors.secondary}; } }
  .today-btn { background: #222; border: 1px solid #444; color: #ccc; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; cursor: pointer; transition: 0.2s; &:hover { border-color: ${theme.colors.secondary}; color: ${theme.colors.secondary}; } }
  .close-btn { position: absolute; right: 0; background: none; border: none; color: #666; cursor: pointer; font-size: 1.2rem; padding: 5px; transition: 0.2s; &:hover { color: white; } }
  
  .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; text-align: center; }
  .day-name { font-size: 0.9rem; color: #666; margin-bottom: 5px; font-weight: bold; }
  
  .day { 
    width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 1rem; cursor: pointer; color: #aaa; transition: 0.2s; 
    &:hover { background: #333; color: white; } 
    &.recorded { border: 1px solid ${theme.colors.secondary}; color: ${theme.colors.secondary}; } 
    &.selected { background: ${theme.colors.secondary}; color: #000; font-weight: bold; border: none; } 
  }
`;