import styled from '@emotion/styled';
import { theme } from '../../styles/theme';

export const CenterPanel = styled.div`
  border-radius: 40px;
  border: none;
  padding: 30px;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  position: relative;
  
  /* [중요] 높이를 100%로 주되, 부모가 높이가 없으면 깨지므로 최소 높이 지정 */
  width: 100%;
  height: 100%; 
  min-height: 300px; /* 최소 이만큼은 확보하라는 뜻 */
  
  box-sizing: border-box;
  overflow: hidden;
`;