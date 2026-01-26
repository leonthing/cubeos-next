const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 외부 이미지 도메인 허용
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.nthing.link',
      },
    ],
  },

  // Turbopack 루트 디렉토리 설정
  turbopack: {
    root: __dirname,
  },

  // 환경 변수
  env: {
    NEXT_PUBLIC_APP_VERSION: '2.0.0',
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
    ];
  },

  // API 프록시 - CORS 우회
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://api.nthing.link:8080/:path*',
      },
    ];
  },

};

module.exports = withPWA(nextConfig);
