// ==================================================
// cubeOS API 클라이언트
// 기존 백엔드 API와 연동하기 위한 모듈
// ==================================================

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// 환경 변수에서 API 주소 가져오기
// Vercel 배포 시 프록시가 작동하지 않아 직접 연결
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.nthing.link:8080';
const API_ENV = process.env.NEXT_PUBLIC_API_ENV || 'production';

// Farm API 경로
// 읽기 API는 'portal' 경로 사용 (Farm-Id 헤더로 필터링)
// 장치 제어 API는 동적 farmId 경로 사용
const FARM_PATH = 'portal';

/**
 * API 클라이언트 생성
 * 모든 API 요청에 공통으로 사용됨
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30초 타임아웃
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 요청 인터셉터: 토큰 자동 추가
  client.interceptors.request.use(
    (config) => {
      // 로컬 스토리지에서 토큰 가져오기
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('cubeToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // 현재 농장 코드 추가
        const farmId = localStorage.getItem('currentFarm');
        if (farmId) {
          config.headers['Farm-Id'] = farmId;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터: 에러 처리
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // 401 에러: 토큰 만료 → 로그아웃 처리
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cubeToken');
          localStorage.removeItem('currentFarm');
          window.location.href = '/auth/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// API 클라이언트 인스턴스
export const api = createApiClient();

// ==================================================
// 인증 API
// ==================================================

// 로그인은 프록시를 거치지 않고 직접 API 서버로 요청
const AUTH_API_URL = 'https://api.nthing.link:8080';

export const authApi = {
  /**
   * 로그인
   */
  login: async (email: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    params.append('grant_type', 'password');

    const response = await axios.post(
      `${AUTH_API_URL}/auth/${API_ENV}/oauth/token`,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: 'cube-farm',
          password: 'nthing_dkaghdi00', // TODO: 보안 개선 필요
        },
      }
    );
    return response.data;
  },

  /**
   * 계정 정보 조회
   */
  getAccount: async (username: string) => {
    const response = await api.get(`/auth/${API_ENV}/account/getAccountByName`, {
      params: { username },
    });
    return response.data;
  },

  /**
   * 비밀번호 변경
   */
  updatePassword: async (data: { username: string; oldPassword: string; newPassword: string }) => {
    const response = await api.post(`/auth/${API_ENV}/account/updatePassword`, data);
    return response.data;
  },
};

// ==================================================
// 사이트 API
// ==================================================

export const siteApi = {
  /**
   * 사이트 목록 조회
   */
  getSites: async (farmId: string) => {
    const response = await api.get(`/farm/${FARM_PATH}/site/getSite`);
    return response.data;
  },

  /**
   * 사이트 상세 조회
   */
  getSite: async (farmId: string, siteId: string) => {
    const response = await api.get(`/farm/${FARM_PATH}/site/getSite`, {
      params: { sid: siteId },
    });
    return response.data;
  },

  /**
   * 알람 설정
   */
  updateAlarm: async (farmId: string, data: { sid: string; alarm: boolean }) => {
    const params = new URLSearchParams();
    params.append('sid', data.sid);
    params.append('alarm', String(data.alarm));

    const response = await api.post(
      `/farm/${FARM_PATH}/site/updateSiteAlarm`,
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data;
  },
};

// ==================================================
// 게이트웨이 API
// ==================================================

export const gatewayApi = {
  /**
   * 센서 게이트웨이 목록
   */
  getSensorGateways: async (farmId: string) => {
    const response = await api.get(`/farm/${FARM_PATH}/gateway/getSensorGateway`);
    return response.data;
  },

  /**
   * 컨트롤러 게이트웨이 목록
   */
  getControllerGateways: async (farmId: string) => {
    const response = await api.get(`/farm/${FARM_PATH}/gateway/getControllerGateway`);
    return response.data;
  },

  /**
   * 특정 게이트웨이 조회
   */
  getGateway: async (farmId: string, gatewayId: string) => {
    const response = await api.get(`/farm/${FARM_PATH}/gateway/getGatewayByGatewayId`, {
      params: { gid: gatewayId },
    });
    return response.data;
  },

  /**
   * 사이트별 게이트웨이
   */
  getGatewaysBySite: async (farmId: string, siteId: string) => {
    const response = await api.get(`/farm/${FARM_PATH}/gateway/getGatewayBySiteId`, {
      params: { sid: siteId },
    });
    return response.data;
  },
};

// ==================================================
// 장치 제어 API
// ==================================================

export const deviceApi = {
  /**
   * 장치 타입 목록
   */
  getDeviceTypes: async (farmId: string) => {
    const response = await api.get(`/farm/${FARM_PATH}/device/getDeviceType`);
    return response.data;
  },

  /**
   * 장치 제어 공통 함수 (Next.js rewrites 프록시 사용)
   */
  _controlDevice: async (farmId: string, endpoint: string, params: Record<string, any>) => {
    // 토큰과 Farm-Id 가져오기
    const currentFarm = typeof window !== 'undefined' ? localStorage.getItem('currentFarm') : null;

    // 파라미터를 URLSearchParams로 변환
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      urlParams.append(key, String(value));
    });

    // Next.js rewrites를 통한 프록시 사용
    const url = `/api/proxy/farm/${farmId}/device/${endpoint}`;

    // Basic Auth 인코딩
    const basicAuth = btoa('cube-farm:nthing_dkaghdi00');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
        ...(currentFarm && { 'Farm-Id': currentFarm }),
      },
      body: urlParams.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Device Control] Error:', response.status, errorText);
      throw new Error(`Device control failed: ${response.status}`);
    }

    return response.json();
  },

  /**
   * LED 제어
   */
  ledControl: async (farmId: string, data: {
    gid: string;
    did: string;
    num: number;
    command: boolean;
    dtype?: string;
    ontime?: number;
    offtime?: number;
    auto?: boolean;
    coupling?: boolean;
  }) => {
    return deviceApi._controlDevice(farmId, 'ledControl', data);
  },

  /**
   * 펌프 제어
   */
  pumpControl: async (farmId: string, data: {
    gid: string;
    did: string;
    num: number;
    command: boolean;
    dtype?: string;
  }) => {
    return deviceApi._controlDevice(farmId, 'pumpControl', data);
  },

  /**
   * 에어컨 제어
   */
  acControl: async (farmId: string, data: {
    gid: string;
    did: string;
    num: number;
    command: boolean;
    dtype?: string;
    temp?: number;
  }) => {
    return deviceApi._controlDevice(farmId, 'acControl', data);
  },

  /**
   * 범용 스위치 제어
   */
  switchControl: async (farmId: string, data: {
    gid: string;
    did: string;
    num: number;
    command: boolean;
    dtype?: string;
  }) => {
    return deviceApi._controlDevice(farmId, 'switchControl', data);
  },

  /**
   * 자동/수동 모드 전환
   */
  setAutoMode: async (farmId: string, data: {
    gid: string;
    did: string;
    num: number;
    auto: boolean;
  }) => {
    return deviceApi._controlDevice(farmId, 'autoControl', data);
  },
};

// ==================================================
// 로그 API
// ==================================================

export const logApi = {
  /**
   * 센서 로그 조회 (그래프용)
   */
  getSensorLogs: async (params: {
    farmId: string;
    gatewayId?: string;
    deviceId?: string;
    startTime?: number;
    endTime?: number;
  }) => {
    const response = await api.get(`/log-api/${API_ENV}/sensor/log`, {
      params: {
        farmId: params.farmId,
        gatewayId: params.gatewayId,
        deviceId: params.deviceId,
        startTime: params.startTime,
        endTime: params.endTime,
      },
    });
    return response.data;
  },

  /**
   * 센서 로그 조회 (페이지네이션)
   */
  getSensorLogsPage: async (params: {
    farmId: string;
    deviceId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await api.get(`/log-api/${API_ENV}/sensor/log/page`, {
      params: {
        did: params.deviceId,
        start_date: params.startDate,
        end_date: params.endDate,
        page_num: params.page || 0,
        page_size: params.size || 20,
      },
    });
    return response.data;
  },

  /**
   * 제어 로그 조회
   */
  getControlLogs: async (params: {
    farmId: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await api.get(`/log-api/${API_ENV}/control/log/page`, {
      params: {
        start_date: params.startDate,
        end_date: params.endDate,
        page_num: params.page || 0,
        page_size: params.size || 20,
      },
    });
    return response.data;
  },

  /**
   * 알림 로그 조회
   */
  getAlertLogs: async (params: {
    page?: number;
    size?: number;
  }) => {
    const response = await api.get(`/log-api/${API_ENV}/alert/log/page`, {
      params: {
        page_num: params.page || 0,
        page_size: params.size || 20,
      },
    });
    return response.data;
  },

  /**
   * 로그 다운로드 (CSV)
   */
  downloadSensorLog: async (params: {
    deviceId: string;
    startDate: string;
    endDate: string;
  }) => {
    const response = await api.get(`/log-api/${API_ENV}/sensor/log/download`, {
      params: {
        did: params.deviceId,
        start_date: params.startDate,
        end_date: params.endDate,
      },
      responseType: 'blob',
    });
    return response.data;
  },
};

// ==================================================
// 레시피 API
// ==================================================

export const recipeApi = {
  /**
   * 레시피 목록
   */
  getRecipes: async () => {
    const response = await api.get(`/recipe/${API_ENV}/recipe/getRecipes`);
    return response.data;
  },

  /**
   * 레시피 등록
   */
  createRecipe: async (data: any) => {
    const response = await api.post(`/recipe/${API_ENV}/v2/recipe/registerRecipe`, data);
    return response.data;
  },

  /**
   * 레시피 수정
   */
  updateRecipe: async (data: any) => {
    const response = await api.post(`/recipe/${API_ENV}/recipe/updateRecipeByRecipeId`, data);
    return response.data;
  },

  /**
   * 레시피 삭제
   */
  deleteRecipe: async (recipeId: string) => {
    const params = new URLSearchParams();
    params.append('recipeId', recipeId);

    const response = await api.post(
      `/recipe/${API_ENV}/recipe/deleteRecipeByRecipeId`,
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data;
  },

  /**
   * 작물 목록
   */
  getPlants: async () => {
    const response = await api.get(`/recipe/${API_ENV}/plant/getPlants`);
    return response.data;
  },

  /**
   * 레시피 카테고리 목록
   */
  getCategories: async () => {
    const response = await api.get(`/recipe/${API_ENV}/recipeCategory/getRecipeCategories`);
    return response.data;
  },

  /**
   * 사이트 타입 목록
   */
  getSiteTypes: async () => {
    const response = await api.get(`/recipe/${API_ENV}/siteType/getSiteTypes`);
    return response.data;
  },
};

export default api;
