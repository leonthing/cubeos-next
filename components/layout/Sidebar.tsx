// ==================================================
// 사이드바 네비게이션 컴포넌트
// ==================================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import {
  LayoutDashboard,
  Thermometer,
  Power,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';

// 네비게이션 메뉴 항목
const menuItems = [
  {
    name: '대시보드',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: '센서 모니터링',
    href: '/sensors',
    icon: Thermometer,
  },
  {
    name: '컨트롤러',
    href: '/controllers',
    icon: Power,
  },
  {
    name: '레시피',
    href: '/recipes',
    icon: BookOpen,
  },
  {
    name: '로그',
    href: '/logs',
    icon: FileText,
  },
  {
    name: '설정',
    href: '/settings',
    icon: Settings,
    roles: ['master', 'manager'], // 이 역할만 접근 가능
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, setCurrentLocation } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // 접근 가능한 농장 목록
  const farms = user?.aud
    ?.filter((a) => a.includes('cube-farm-'))
    .map((a) => a.split('-')[2])
    .sort() || [];

  // 메뉴 접근 권한 확인
  const hasAccess = (item: typeof menuItems[0]) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.currentRole);
  };

  // 페이지 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // 모바일 메뉴 열릴 때 스크롤 방지
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const SidebarContent = () => (
    <>
      {/* 로고 */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-bold text-gray-900">cubeOS</span>
        </Link>
        {/* 모바일 닫기 버튼 */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="ml-auto lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 농장 선택 */}
      {farms.length > 1 && (
        <div className="px-4 py-3 border-b border-gray-200">
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            현재 농장
          </label>
          <div className="relative">
            <select
              value={user?.currentLocation || ''}
              onChange={(e) => setCurrentLocation(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {farms.map((farm) => (
                <option key={farm} value={farm}>
                  {farm.toUpperCase()} 농장
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      )}

      {/* 단일 농장인 경우 */}
      {farms.length === 1 && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-gray-700">
            <Building2 className="w-4 h-4" />
            <span className="font-medium">{farms[0].toUpperCase()} 농장</span>
          </div>
        </div>
      )}

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (!hasAccess(item)) return null;

          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* 사용자 정보 & 로그아웃 */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email}
            </p>
            <p className="text-xs text-gray-500">
              {user?.currentRole === 'master' && '전체 관리자'}
              {user?.currentRole === 'manager' && '농장 관리자'}
              {user?.currentRole === 'user' && '사용자'}
              {user?.currentRole === 'monitoring' && '모니터링'}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="로그아웃"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 모바일 헤더 바 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40 flex items-center px-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/dashboard" className="flex items-center space-x-2 ml-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <span className="text-lg font-bold text-gray-900">cubeOS</span>
        </Link>
      </div>

      {/* 모바일 오버레이 */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 모바일 사이드바 (슬라이드) */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white z-50 flex flex-col transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* 데스크톱 사이드바 */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col h-screen fixed left-0 top-0">
        <SidebarContent />
      </aside>
    </>
  );
}
