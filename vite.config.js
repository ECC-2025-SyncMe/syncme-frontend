import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // 팝업 통신을 허용하기 위해 설정
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
