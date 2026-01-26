// ==================================================
// 루트 레이아웃
// 모든 페이지에 공통으로 적용되는 레이아웃
// ==================================================

import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'cubeOS - 스마트팜 모니터링 시스템',
  description: '모듈형 수직농장 모니터링 및 운영 플랫폼',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'cubeOS',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icons/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
