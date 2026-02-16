import styled from '@emotion/styled';
import { theme } from '../../styles/theme';

export const CenterPanel = styled.div`
 
  /* [수정 포인트] 모서리를 기존보다 더 강조하여 둥글게 설정 */
  border-radius: 40px; 
  
  border: none;
  padding: 30px; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center;
  position: relative; 
  height: 100%; 
  box-sizing: border-box;

  /* 내부 요소가 모서리 밖으로 나가지 않게 설정 */
  overflow: hidden;
`;