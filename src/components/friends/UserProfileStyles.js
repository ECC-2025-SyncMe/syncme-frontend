import styled from '@emotion/styled';
import { theme } from '../../styles/theme';

export const LeftHeader = styled.div`
  width: 100%; display: flex; justify-content: space-between; align-items: center; 
  margin-bottom: 10px; height: 30px;
`;

export const ModelBox = styled.div`
  width: 100%; aspect-ratio: 1 / 1.1; 
  background: #111; 
  border: 1px dashed ${theme.colors.border}; 
  border-radius: 20px;
  margin: 10px 0 20px 0; 
  display: flex; align-items: center; justify-content: center;
  color: #444; font-weight: bold; font-size: 0.9rem;
`;

export const IntroText = styled.p`
  margin: 0; color: #ddd; font-size: 1rem; line-height: 1.6; 
  text-align: left; width: 100%;
  word-break: keep-all; white-space: pre-wrap; 
`;