import axios from 'axios';

const api = axios.create({
    baseURL: 'https://lrcc5bl2sj.execute-api.ap-northeast-2.amazonaws.com/default',
    headers: { 'Content-Type': 'application/json' }
});

// 요청을 보내기 전, 로컬 스토리지에 토큰이 있다면 헤더에 추가
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;