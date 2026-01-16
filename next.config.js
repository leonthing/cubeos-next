/** @type {import('next').NextConfig} */
const nextConfig = {
  // 외부 이미지 도메인 허용
  images: {
    domains: ['api.nthing.link'],
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

};

module.exports = nextConfig;
