// 로그인 페이지
import '../styles/LoginPage.css';
import Logo from '../assets/Logo.png';
import Loginbtn from '../assets/Google_Login_btn.png';

import { googleLogin } from '../api/login';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    // .env에 저장한 VITE_API_URL을 가져와서 백엔드 주소로 바로 보냄
    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL;
      if (!BACKEND_URL) {
        throw new Error('API URL이 설정되지 않았습니다.');
      }
      window.location.href = `${BACKEND_URL}/auth/google/login`;
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      alert('Google 로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="logo">
          <img src={Logo} alt="SyncMe Logo" className="main-logo" />
        </div>

        <div className="login-button">
          <button onClick={handleGoogleLogin} className="google-login-btn">
            <img src={Loginbtn} alt="Google Icon" className="google-logo" />
          </button>
        </div>
      </div>
    </div>
  );
}
