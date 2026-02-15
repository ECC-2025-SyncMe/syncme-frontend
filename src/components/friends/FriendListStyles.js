import styled from '@emotion/styled';
import { theme } from '../../styles/theme';

export const SearchBar = styled.div`
  display: flex; align-items: center; 
  background: #252525; padding: 12px; border-radius: 12px; 
  margin-bottom: 20px; border: 1px solid ${theme.colors.border}; 
  input { border: none; background: transparent; outline: none; color: white; width: 100%; }
`;

export const TabContainer = styled.div`
  display: flex; border-bottom: 1px solid ${theme.colors.border}; margin-bottom: 15px;
`;

export const TabButton = styled.button`
  flex: 1; padding: 12px; background: none; border: none; cursor: pointer; 
  font-size: 1rem; font-weight: bold;
  color: ${props => props.active ? theme.colors.secondary : '#888'};
  border-bottom: 2px solid ${props => props.active ? theme.colors.secondary : 'transparent'};
  &:hover { color: ${theme.colors.secondary}; }
`;

export const List = styled.div` 
  flex: 1; overflow-y: auto; width: 100%; 
`;

export const Item = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 15px 10px; border-bottom: 1px solid #2a2a2a;
  &:hover { background: #222; } 
  .profile-section { display: flex; align-items: center; gap: 12px; }
  .p-img { width: 45px; height: 45px; border-radius: 50%; background: ${props => props.color}; flex-shrink: 0; }
  .info h4 { margin: 0 0 4px 0; color: #fff; font-size: 1rem; }
  .info p { margin: 0; color: #aaa; font-size: 0.85rem; }
  .actions { display: flex; align-items: center; gap: 15px; }
  .icon-btn { cursor: pointer; font-size: 1.2rem; color: #666; transition: 0.2s; display: flex; align-items: center; }
  .icon-btn.plus:hover { color: ${theme.colors.secondary}; }
  .icon-btn.check { color: ${theme.colors.secondary}; font-size: 1.4rem; } 
  .icon-btn.arrow:hover { color: white; }
`;