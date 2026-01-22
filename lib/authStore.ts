// ==================================================
// 인증 상태 관리 Store (Zustand)
// ==================================================

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { authApi } from './api';
import type { User, JWTPayload, UserRole } from '@/types';

/**
 * 인증 상태 인터페이스
 */
interface AuthState {
  // 상태
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 액션
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentLocation: (location: string) => void;
  clearError: () => void;
}

/**
 * localStorage에서 즐겨찾기 농장 목록 가져오기
 */
function getFavoriteFarms(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('cubeos-ui-state');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.favoriteFarms || [];
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

/**
 * JWT 토큰에서 사용자 정보 추출
 */
function parseUserFromToken(token: string): User {
  const payload = jwtDecode<JWTPayload>(token);

  // 권한에서 현재 위치와 역할 파싱
  let currentLocation = '';
  let currentRole: UserRole = 'user';

  // 마스터 계정인 경우
  if (payload.authorities.some(auth => auth === 'cube-farm-master')) {
    // aud에서 농장 목록 추출
    const farmCodes = payload.aud
      .filter(a => a.includes('cube-farm-'))
      .map(a => a.split('-')[2]);

    // 즐겨찾기 농장을 맨 위로 정렬
    const favoriteFarms = getFavoriteFarms();
    const sortedFarms = farmCodes.sort((a, b) => {
      const aFav = favoriteFarms.includes(a);
      const bFav = favoriteFarms.includes(b);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return a.localeCompare(b);
    });

    if (sortedFarms.length > 0) {
      currentLocation = sortedFarms[0];
    }
    currentRole = 'master';
  } else {
    // 일반 사용자: 첫 번째 권한에서 위치와 역할 파싱
    const sortedAuth = payload.authorities.sort();
    if (sortedAuth.length > 0) {
      // 형식: cube-farm-{location}-{role}
      const parts = sortedAuth[0].split('-');
      if (parts.length >= 4) {
        currentLocation = parts[2];
        currentRole = parts[3] as UserRole;
      }
    }
  }

  return {
    email: payload.user_name,
    language: payload.language,
    currentLocation,
    currentRole,
    authorities: payload.authorities,
    aud: payload.aud,
  };
}

/**
 * 인증 Store
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * 로그인
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // API 호출
          const response = await authApi.login(email, password);
          const token = response.access_token;

          // 토큰에서 사용자 정보 파싱
          const user = parseUserFromToken(token);

          // 상태 업데이트
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // 로컬 스토리지에 추가 정보 저장
          if (typeof window !== 'undefined') {
            localStorage.setItem('cubeToken', token);
            localStorage.setItem('currentFarm', user.currentLocation);
          }
        } catch (error: any) {
          const errorMessage = 
            error.response?.data?.error_description ||
            error.response?.data?.message ||
            '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });

          throw new Error(errorMessage);
        }
      },

      /**
       * 로그아웃
       */
      logout: () => {
        // 상태 초기화
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // 로컬 스토리지 정리
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cubeToken');
          localStorage.removeItem('currentFarm');
        }
      },

      /**
       * 현재 농장 변경
       */
      setCurrentLocation: (location: string) => {
        const { user } = get();
        if (!user) return;

        // 권한 확인
        const hasAccess = 
          user.authorities.includes('cube-farm-master') ||
          user.authorities.some(auth => auth.includes(`cube-farm-${location}`));

        if (!hasAccess) {
          set({ error: '해당 농장에 접근 권한이 없습니다.' });
          return;
        }

        // 역할 파싱
        let newRole: UserRole = 'user';
        if (user.authorities.includes('cube-farm-master')) {
          newRole = 'master';
        } else {
          const auth = user.authorities.find(a => a.includes(`cube-farm-${location}`));
          if (auth) {
            newRole = auth.split('-')[3] as UserRole;
          }
        }

        // 상태 업데이트
        set({
          user: {
            ...user,
            currentLocation: location,
            currentRole: newRole,
          },
        });

        // 로컬 스토리지 업데이트
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentFarm', location);
        }
      },

      /**
       * 에러 초기화
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'cube-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
