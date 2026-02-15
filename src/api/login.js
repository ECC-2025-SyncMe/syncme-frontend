// 파일 위치가 src/api/login.js 라면 같은 폴더의 axios.js를 가져옵니다.
import axios from 'axios';

export const googleLogin = async () => axios.post('/auth/google/login');
export const checkToken = async () => axios.post('/auth/refresh'); // 토큰 유효성 검사 및 갱신
