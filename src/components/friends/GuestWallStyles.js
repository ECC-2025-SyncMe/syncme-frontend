import styled from '@emotion/styled';
import { theme } from '../../styles/theme';

export const WallList = styled.div`
  flex: 1; overflow-y: auto; background: #111; 
  padding: 15px; border-radius: 15px; 
  border: 1px solid #222; margin-bottom: 10px;
`;

export const CommentBubble = styled.div`
  margin-bottom: 15px; border-bottom: 1px solid #222; padding-bottom: 10px; 
  .writer { color: ${theme.colors.primary}; font-weight: bold; font-size: 0.9rem; display: block; margin-bottom: 4px; } 
  .text { color: #eee; font-size: 0.95rem; }
`;

export const InputArea = styled.div`
  width: 100%; display: flex; gap: 10px; 
  input { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #444; background: #252525; color: white; } 
  button { background: ${theme.colors.primary}; color: white; border: none; padding: 0 20px; border-radius: 8px; cursor: pointer; font-weight: bold; }
`;

export const ToggleButton = styled.div`
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: transform 0.3s ease, color 0.3s ease;
  transform: ${props => props.isActive ? 'rotate(90deg)' : 'rotate(0deg)'}; 
  color: ${props => props.isActive ? '#ffffff' : theme.colors.primary};
  &:hover { color: #ffffff; }
`;