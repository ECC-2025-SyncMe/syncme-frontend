// 파일 위치가 src/api/login.js 라면 같은 폴더의 axios.js를 가져옵니다.
import axios from './axios';

export const googleLogin = () => {
  const BACKEND_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
  if (!BACKEND_URL) throw new Error('VITE_API_URL이 설정되지 않았습니다.');
  
  window.location.assign(`${BACKEND_URL}/auth/google/login`);
};
 // 구글 로그인

export const checkToken = async () => axios.post('/auth/refresh'); // 토큰 유효성 검사 및 갱신