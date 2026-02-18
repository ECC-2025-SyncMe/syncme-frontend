// 시스템 설정 페이지
import { useState, useEffect } from 'react';
import '../styles/SettingPage.css';
import User from '../assets/User.png';

import { FiEdit2, FiLogOut, FiTrash2 } from "react-icons/fi";
import { RiRestartLine } from "react-icons/ri";
import { FaGithub, FaFigma } from "react-icons/fa";
import { SiNotion } from "react-icons/si";

import {
  settingUserData,
  settingDeleteData,
  ChangeName,
  settingLogout,
  DeleteAccount,
  getUserInfo,
} from '../api/setting';

export default function SettingPage() {
  // 서버 데이터를 저장할 상태(State) 선언
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await settingUserData();
        const user = res.data?.data ?? res.data;
        setUserData(user);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData(); // 사용자 데이터 로드
  }, []);


  // 이메일 정보
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserInfo();
        setUserData(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  // 1. 프로필 편집
  const handleChangeName = async () => {
    const newNickname = prompt('새 닉네임을 입력하세요:');
    if (!newNickname) return;
    try {
      await ChangeName({ nickname: newNickname });
      alert('닉네임이 변경되었습니다.');
      setUserData((prev) => ({ ...prev, nickname: newNickname }));
    } catch (error) {
      console.error('닉네임 변경 실패:', error);
      alert('닉네임 변경에 실패했습니다.');
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
        window.location.href = '/';
      } catch (error) {
        console.error('계정 삭제 실패:', error);
        alert('요청을 처리할 수 없습니다.');
      }
    }
  };

  // 5. About: 내 계정 정보 조회
  const handleGetUserInfo = async () => {
    try {
      const res = await settingUserData();
      const user = res.data?.data ?? res.data;

      alert(
        `이메일: ${user.email}\n닉네임: ${user.nickname}`,
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

  // 링크 이동 함수 (새 탭으로 열기)
  const openLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) return <div className="setting-page">Loading...</div>;

  return (
    <div className="setting-page">
      <main className="setting-main">
        {/* 상단 프로필 영역 */}
        <section className="profile">
          <div className="profile-img-wrapper">
            <img src={User} className="user-img" alt="profile" />
          </div>
          <span className="profile-email">
            {userData?.email || 'wpdls@gmail.com'}
          </span>
        </section>

        {/* 메뉴 그룹 1 */}
        <section className="menu">
          <button className="menu-item" onClick={handleChangeName}>
            <FiEdit2 className="menu-icon" />
            <span className="menu-text">
              {userData?.nickname || 'JANE'}
            </span>
          </button>

          <button className="menu-item" onClick={handleLogout}>
            <FiLogOut className="menu-icon" />
            <span>로그아웃</span>
          </button>
        </section>

        <hr className="divider" />

        {/* 메뉴 그룹 2 */}
        <section className="menu">
          {/* 아이콘 변경됨 */}
          <button className="menu-item" onClick={handleResetData}>
            <RiRestartLine className="menu-icon" />
            <span>데이터 초기화</span>
          </button>

          <button className="menu-item danger" onClick={handleDelete}>
            <FiTrash2 className="menu-icon" />
            <span>계정 삭제</span>
          </button>
        </section>

        <hr className="divider" />

        {/* 하단 정보 및 링크 */}
        <section className="footer-info">
          <div className="footer-links">
            <span>About</span>
            <span>Services</span>
          </div>

          <div className="social-icons">
            <FaGithub className="social-icon" onClick={() => openLink('https://github.com/ECC-2025-SyncMe')} />
            <FaFigma className="social-icon" onClick={() => openLink('https://www.figma.com/proto/xHbZbifU7sbM86sqsyEbMd/ECC_SyncMe?node-id=5-2&starting-point-node-id=5%3A2&t=O2LkKS7CHS9YHpJV-1')} />
            <SiNotion className="social-icon" onClick={() => openLink('https://www.notion.so/1-2e46ce44b4038033b4fafe45f0d3594d')} />
          </div>
        </section>
      </main>
    </div>
  );
}