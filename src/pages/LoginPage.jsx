// 로그인 페이지
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../api/login';
import '../styles/LoginPage.css';
import Logo from '../assets/Logo.png';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Google에서 받은 ID Token (credential)을 백엔드로 전송
      const data = await googleLogin(credentialResponse.credential);

      // 백엔드에서 받은 JWT 토큰과 사용자 정보를 localStorage에 저장
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('nickname', data.nickname);
      localStorage.setItem('email', data.email);

      // 홈 페이지로 이동
      navigate('/home');
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      alert('Google 로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleGoogleError = () => {
    console.error('Google 로그인 에러');
    alert('Google 로그인에 실패했습니다.');
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="logo">
          <img src={Logo} alt="SyncMe Logo" className="main-logo" />
        </div>

        <div className="login-button">
          {/* Google OAuth 로그인 버튼 (ID Token 방식) */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="filled_blue"
            size="large"
            text="signin_with"
            shape="rectangular"
          />
        </div>
      </div>
    </div>
  );
}
