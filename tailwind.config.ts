import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // cubeOS 브랜드 컬러
        cube: {
          primary: '#2563eb',    // 메인 블루
          secondary: '#10b981',  // 그린 (정상 상태)
          warning: '#f59e0b',    // 경고
          danger: '#ef4444',     // 위험/에러
          dark: '#1e293b',       // 다크 배경
          light: '#f8fafc',      // 라이트 배경
        }
      },
    },
  },
  plugins: [],
}
export default config
