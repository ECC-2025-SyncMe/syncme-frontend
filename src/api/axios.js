import axios from 'axios';

const api = axios.create({
  baseURL:
    'https://lrcc5bl2sj.execute-api.ap-northeast-2.amazonaws.com/default', // 백엔드 주소
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
