// 로그인 페이지
import '../styles/LoginPage.css';
import Logo from '../assets/Logo.png';
import Loginbtn from '../assets/Google_Login_btn.png';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    // 실제 구글 로그인 연동 시 여기에 로직 연결
    console.log('Google 로그인 시도');
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
