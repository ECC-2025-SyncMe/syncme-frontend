// 시스템 설정 페이지
import '../styles/SettingPage.css';
import User from '../assets/User.png';

export default function SettingPage() {
  const userData = {
    email: 'ewha2026@ewhain.com',
  };

  return (
    <div className="setting-page">
      <main className="setting-main">
        <section className="profile">
          <div className="profile-img">
            <img src={User} className="user-img"></img>
          </div>
          <span className="profile-email">{userData.email}</span>
        </section>

        <section className="menu">
          <button className="menu-item">프로필 편집</button>
          <button className="menu-item" onClick={() => console.log('Logout')}>
            로그아웃
          </button>
        </section>

        <hr className="divider" />

        <section className="menu">
          <button className="menu-item">데이터 초기화</button>
          <button
            className="menu-item"
            onClick={() => console.log('Delete Account')}
          >
            계정 삭제
          </button>
        </section>

        <hr className="divider" />

        <section className="footer-menu">
          <button>About</button>
          <button>Services</button>
        </section>
      </main>
    </div>
  );
}
