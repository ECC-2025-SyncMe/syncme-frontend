// 파일 위치가 src/api/login.js 라면 같은 폴더의 axios.js를 가져옵니다.
import axios from 'axios';
import api from './axios';

export const googleLogin = async () => {
  try {
    return await api.post('/auth/google/login');
  } catch (error) {
    console.error('Google Login API Error:', error); // 빨간 줄 방지 및 디버깅
    throw error;
  }
};

export const checkToken = async () => axios.get('/auth/refresh'); // 토큰 유효성 검사 및 갱신
