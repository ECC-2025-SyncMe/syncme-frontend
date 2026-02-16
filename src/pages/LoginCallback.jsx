import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // URL에서 쿼리 파라미터(token, refreshToken 등) 추출
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    const userId = params.get('userId');
    const email = params.get('email');
    const nickname = params.get('nickname');

    if (token && refreshToken) {
      // localStorage에 저장
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      if (userId) localStorage.setItem('userId', userId);
      if (email) localStorage.setItem('email', email);
      if (nickname) localStorage.setItem('nickname', nickname);

      // 홈 페이지로 이동
      navigate('/home');
    } else {
      alert('로그인에 실패했습니다.');
      navigate('/');
    }
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px',
      color: '#666'
    }}>
      로그인 처리 중입니다. 잠시만 기다려주세요...
    </div>
  );
}

