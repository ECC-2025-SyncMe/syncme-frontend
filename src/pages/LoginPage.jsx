import React from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동용
import { useGoogleLogin } from '@react-oauth/google'; // 구글 로그인 훅
import api from '../api/axios';

import '../styles/Login.css';
import Logo from '../assets/Logo.png';
import Loginbtn from '../assets/Google_Login_btn.png';

export default function Login() {
  const navigate = useNavigate();

  // 구글 로그인 성공 시 실행될 함수
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('구글 인증 성공!', tokenResponse);

      try {
        // 백엔드에 구글 토큰을 보내서 우리 서비스 전용 토큰(JWT) 발급받기
        // (POST /auth/google/login API 호출)
        const res = await api.post('/auth/google/login', {
          token: tokenResponse.access_token, // 백엔드 명세에 따라 키 이름 확인 필요 (token 또는 accessToken)
        });

        // 백엔드에서 받은 응답(아까 보여준 JSON) 처리
        const { token, refreshToken, userId, nickname } = res.data.data;

        // 로컬 스토리지에 저장
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', userId);
        localStorage.setItem('nickname', nickname);

        console.log("로그인 완료! 홈으로 이동합니다.");

        // 홈 화면으로 이동
        navigate('/home');

      } catch (error) {
        console.error("백엔드 로그인 실패:", error);
        alert("로그인 처리 중 오류가 발생했습니다.");
      }
    },
    onError: errorResponse => {
      console.error("구글 로그인 창 닫힘/실패", errorResponse);
    },
  });

  return (
    <div className="login-container">
      <div className="login-content">
        {/* 로고 이미지 */}
        <div className="logo">
          <img src={Logo} alt="SyncMe Logo" className="main-logo" />
        </div>

        <div className="login-button">
          {/* 버튼 클릭 시 googleLogin() 함수 실행 */}
          <button onClick={() => googleLogin()} className="google-login-btn">
            <img src={Loginbtn} alt="Google Icon" className="google-logo" />
          </button>
        </div>
      </div>
    </div>
  );
}