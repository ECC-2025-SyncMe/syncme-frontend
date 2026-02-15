import axios from 'axios';

// 환경변수에서 API 주소 가져오기
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터: API 호출 시마다 토큰을 헤더에 담아 보냄
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
    }
);

// 응답 인터셉터: 401 에러(토큰 만료) 발생 시 처리
api.interceptors.response.use(
    (response) => {
        // 응답이 성공적이면 그대로 반환
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // 401 에러가 떴고, 아직 재시도하지 않은 요청이라면
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // 재시도 플래그 설정 (무한 루프 방지)

            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    // 토큰 갱신 요청은 인터셉터를 타지 않도록 'axios' 직접 사용
                    const response = await axios.post(
                        `${BASE_URL}/auth/refresh`, // 명세서 기준 엔드포인트
                        { refreshToken: refreshToken }
                    );

                    // 명세서 구조({ success, data: { token, ... } })에 맞춰 데이터 추출
                    const newAccessToken = response.data.data.token;
                    const newRefreshToken = response.data.data.refreshToken;

                    // 새 토큰 저장
                    localStorage.setItem('accessToken', newAccessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    // 실패했던 요청의 헤더를 새 토큰으로 교체
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    // axios 인스턴스의 기본 헤더도 교체 (다음 요청부터 적용)
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                    // 실패했던 요청 재시도
                    return api(originalRequest);

                } catch (refreshError) {
                    console.error("토큰 갱신 실패:", refreshError);
                    // 갱신 실패 시(리프레시 토큰도 만료됨) -> 로그아웃 처리
                    handleLogout();
                    return Promise.reject(refreshError);
                }
            } else {
                // 리프레시 토큰이 아예 없으면 -> 로그아웃 처리
                handleLogout();
            }
        }

        return Promise.reject(error);
    }
);

// 로그아웃 처리 함수 (중복 코드 제거)
const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('nickname');

    alert('로그인 정보가 만료되었습니다. 다시 로그인해주세요.');
    // 페이지 새로고침하며 로그인 페이지로 이동
    window.location.href = '/login';
};

export default api;