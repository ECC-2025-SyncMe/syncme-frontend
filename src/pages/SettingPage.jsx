// 시스템 설정 페이지
import { useState, useEffect } from 'react';
import '../styles/SettingPage.css';
import User from '../assets/User.png';

import {
  settingUserData,
  settingDeleteData,
  ChangeName,
  settingLogout,
  DeleteAccount,
} from '../api/setting';

export default function SettingPage() {
  // 서버 데이터를 저장할 상태(State) 선언
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await settingUserData();
        setUserData(response.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData(); // 사용자 데이터 로드
  }, []);

  if (loading) {
    return <div className="setting-page">Loading...</div>;
  }

  // 1. 프로필 편집
  const handleChangeName = async () => {
    const newNickname = prompt('새 닉네임을 입력하세요:');
    if (newNickname) {
      try {
        await ChangeName({ nickname: newNickname });
        alert('닉네임이 변경되었습니다.');
        window.location.reload(); // 페이지 새로고침으로 변경된 닉네임 반영
      } catch (error) {
        console.error('닉네임 변경 실패:', error);
        alert('닉네임 변경에 실패했습니다.');
      }
    }
  };

  // 2. 로그아웃
  const handleLogout = async () => {
    try {
      await settingLogout();
      localStorage.removeItem('accessToken'); // 저장된 토큰 제거
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 처리 중 오류가 발생했습니다.');
    }
  };

  // 3. 데이터 초기화
  const handleResetData = async () => {
    if (!window.confirm('모든 데이터를 초기화하시겠습니까?')) return;
    try {
      await settingDeleteData();
      alert('데이터가 초기화되었습니다.');
    } catch (error) {
      console.error('데이터 초기화 실패:', error);
      alert('데이터 초기화에 실패했습니다.');
    }
  };

  // 4. 계정 삭제
  const handleDelete = async () => {
    if (window.confirm('정말로 계정을 삭제하시겠습니까?')) {
      try {
        await DeleteAccount();
        alert('계정이 삭제되었습니다.');
        window.location.href = '/login';
      } catch (error) {
        console.error('계정 삭제 실패:', error);
        alert('요청을 처리할 수 없습니다.');
      }
    }
  };

  // 5. About: 내 계정 정보 조회
  const handleGetUserInfo = async () => {
    try {
      const response = await settingUserData();
      alert(
        `이메일: ${response.data.email}\n닉네임: ${response.data.nickname}`,
      );
    } catch (error) {
      console.error('내 계정 정보 조회 실패:', error);
      alert('내 계정 정보를 불러올 수 없습니다.');
    }
  };

  // 6. 설정 정보 조회
  const handleGetSettings = async () => {
    try {
      const response = await settingUserData();
      console.log('설정 정보:', response.data);
    } catch (error) {
      console.error('설정 정보 조회 실패:', error);
      alert('설정 정보를 불러올 수 없습니다.');
    }
  };

  return (
    <div className="setting-page">
      <main className="setting-main">
        <section className="profile">
          <div className="profile-img">
            <img src={User} className="user-img"></img>
          </div>
          <span className="profile-email">
            {userData?.email || '이메일 정보 없음'}
          </span>
        </section>

        <section className="menu">
          <button className="menu-item" onClick={handleChangeName}>
            프로필 편집
          </button>
          <button className="menu-item" onClick={handleLogout}>
            로그아웃
          </button>
        </section>

        <hr className="divider" />

        <section className="menu">
          <button className="menu-item" onClick={() => handleResetData()}>
            데이터 초기화
          </button>
          <button className="menu-item" onClick={handleDelete}>
            계정 삭제
          </button>
        </section>

        <hr className="divider" />

        <section className="footer-menu">
          <button onClick={handleGetUserInfo}>About</button>
          <button onClick={handleGetSettings}>Services</button>
        </section>
      </main>
    </div>
  );
}
