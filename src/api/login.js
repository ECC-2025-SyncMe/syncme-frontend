// 파일 위치가 src/api/login.js 라면 같은 폴더의 axios.js를 가져옵니다.
import api from './axios';

/**
 * Google ID Token을 백엔드로 전송하여 JWT 토큰 발급
 * @param {string} idToken - Google에서 발급받은 ID Token
 * @returns {Promise} - { token, refreshToken, userId, email, nickname }
 */
export const googleLogin = async (idToken) => {
  const response = await api.post('/auth/google/login', { idToken });
  return response.data.data; // API 명세서 구조: { success, message, data }
};

/**
 * Refresh Token을 사용하여 새로운 Access Token 발급
 * @param {string} refreshToken - 저장된 Refresh Token
 * @returns {Promise} - { token, refreshToken, userId, email, nickname }
 */
export const refreshAccessToken = async (refreshToken) => {
  const response = await api.post('/auth/refresh', { refreshToken });
  return response.data.data;
};

