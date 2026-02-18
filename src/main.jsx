import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "";

//ReactDOM.createRoot(document.getElementById('root')).render(
//  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
//    <App />
//  </GoogleOAuthProvider>
//);

const root = ReactDOM.createRoot(document.getElementById('root'));

if (!GOOGLE_CLIENT_ID) {
  console.error('Missing GOOGLE_CLIENT_ID (VITE_GOOGLE_CLIENT_ID)');
  root.render(<App />); // 로그인 기능은 안 되지만 앱 크래시 방지
} else {
  root.render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  );
}