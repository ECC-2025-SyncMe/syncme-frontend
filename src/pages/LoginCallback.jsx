// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// import { checkToken } from '../api/login';

// export default function LoginCallback() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     // 1. URL에서 쿼리 파라미터(token) 추출
//     const params = new URLSearchParams(window.location.search);
//     const token = params.get('token');

//     if (token) {
//       // 2. localStorage에 저장 (axios 인스턴스에서 이 값을 읽어 사용함)
//       localStorage.setItem('accessToken', token);

//       // 3. 메인 페이지 또는 설정 페이지로 이동
//       navigate('/main');
//     } else {
//       alert('로그인에 실패했습니다.');
//       navigate('/login');
//     }
//   }, [navigate]);

//   return <div>로그인 처리 중입니다. 잠시만 기다려주세요...</div>;
// }
