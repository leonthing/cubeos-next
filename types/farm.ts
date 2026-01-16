// ==================================================
// 농장, 사이트, 게이트웨이 관련 타입 정의
// ==================================================

/**
 * 농장 (Farm) - 최상위 단위
 * 예: 서울농장, 부산농장
 */
export interface Farm {
  id: string;
  name: string;
  code: string;           // 농장 코드 (예: seoul, busan)
  address?: string;
  createdAt: string;
}

/**
 * 사이트 (Site) - 농장 내 구역
 * 예: 1층 재배실, 2층 육묘실
 */
export interface Site {
  sid: string;            // 사이트 ID
  sname: string;          // 사이트 이름
  stype: string;          // 사이트 타입
  description?: string;
  alarmEnabled: boolean;  // 알람 활성화 여부
  recipe?: Recipe;        // 적용된 레시피
  environment?: EnvironmentSettings;
}

/**
 * 게이트웨이 - 센서/컨트롤러를 연결하는 장치
 */
export interface Gateway {
  gid: string;            // 게이트웨이 ID
  gname: string;          // 게이트웨이 이름
  gtype: 'sensor' | 'controller';  // 타입
  firmware_version?: string;
  last_update?: number;   // 마지막 업데이트 시간 (Unix timestamp)
  channel?: number;       // 채널 수
  deviceList: Device[];   // 연결된 장치 목록
}

/**
 * 센서 게이트웨이
 */
export interface SensorGateway extends Gateway {
  gtype: 'sensor';
  deviceList: SensorDevice[];
}

/**
 * 컨트롤러 게이트웨이
 */
export interface ControllerGateway extends Gateway {
  gtype: 'controller';
  deviceList: ControllerDevice[];
}

// ==================================================
// 장치 (Device) 타입
// ==================================================

/**
 * 기본 장치 인터페이스
 */
export interface Device {
  did: string;            // 장치 ID
  dtype: string;          // 장치 타입
  dname: string;          // 장치 이름
  num: number;            // 채널 번호
  status: number | string;
  comment?: string;
}

/**
 * 센서 장치
 */
export interface SensorDevice extends Device {
  dtype: SensorType;
  status: number;         // 센서 값
  res_date?: number;      // 응답 시간
  unit: string;           // 단위 (°C, %, ppm 등)
  min?: number;           // 최소 정상 범위
  max?: number;           // 최대 정상 범위
}

/**
 * 센서 타입
 */
export type SensorType = 
  | 'temperature'   // 온도
  | 'humidity'      // 습도
  | 'co2'          // CO2
  | 'ph'           // pH
  | 'ec'           // EC (전기전도도)
  | 'light'        // 조도
  | 'water_level'; // 수위

/**
 * 컨트롤러 장치
 */
export interface ControllerDevice extends Device {
  dtype: ControllerType;
  status: 0 | 1;          // 0: OFF, 1: ON
  mode?: 'auto' | 'manual';
  settings?: ControllerSettings;
}

/**
 * 컨트롤러 타입
 */
export type ControllerType =
  | 'led'          // LED 조명
  | 'pump'         // 펌프
  | 'water'        // 급수
  | 'ac'           // 에어컨
  | 'heater'       // 히터
  | 'freezer'      // 냉동기
  | 'humid'        // 가습기
  | 'ventilator'   // 환풍기
  | 'doser'        // 도저 (양액 공급)
  | 'switch';      // 범용 스위치

/**
 * 컨트롤러 설정 (장치별로 다름)
 */
export interface ControllerSettings {
  targetTemp?: number;    // 목표 온도 (에어컨, 히터)
  brightness?: number;    // 밝기 (LED)
  duration?: number;      // 동작 시간
  interval?: number;      // 동작 간격
}

// ==================================================
// 환경 설정
// ==================================================

/**
 * 환경 설정
 */
export interface EnvironmentSettings {
  temperature?: { min: number; max: number; target: number };
  humidity?: { min: number; max: number; target: number };
  co2?: { min: number; max: number; target: number };
  light?: { on: string; off: string; brightness: number };  // 점등/소등 시간
}

/**
 * 레시피 (재배 설정 템플릿)
 */
export interface Recipe {
  recipeId: string;
  recipeName: string;
  plantName: string;      // 작물명
  category: string;
  environment: EnvironmentSettings;
  duration: number;       // 재배 기간 (일)
  description?: string;
}
