// ==================================================
// 사용자 및 인증 관련 타입 정의
// ==================================================

/**
 * 사용자 정보
 */
export interface User {
  email: string;                    // 이메일 (로그인 ID)
  language: string;                 // 언어 설정
  currentLocation: string;          // 현재 선택된 농장 코드
  currentRole: UserRole;            // 현재 역할
  authorities: string[];            // 전체 권한 목록
  aud: string[];                    // 접근 가능한 농장 목록
}

/**
 * 사용자 역할
 */
export type UserRole = 'master' | 'manager' | 'user' | 'monitoring';

/**
 * 로그인 요청
 */
export interface LoginRequest {
  username: string;
  password: string;
  grant_type: 'password';
}

/**
 * 로그인 응답 (JWT 토큰)
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/**
 * JWT 토큰 페이로드 (디코딩된 토큰 내용)
 */
export interface JWTPayload {
  user_name: string;
  language: string;
  authorities: string[];
  aud: string[];
  exp: number;
}

/**
 * 인증 상태 (Zustand Store)
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // 액션
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentLocation: (location: string) => void;
}
