// ==================================================
// 루트 페이지
// 대시보드로 리다이렉트
// ==================================================

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
}
