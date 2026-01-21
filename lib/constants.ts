// ==================================================
// cubeOS 공통 상수 및 설정
// ==================================================

import {
  Thermometer,
  Droplets,
  Wind,
  Lightbulb,
  Activity,
  Snowflake,
  Fan,
  Zap,
  Power,
} from 'lucide-react';

// ==================================================
// 센서 관련 설정
// ==================================================

/**
 * 센서 타입 정규화
 * 다양한 형식의 센서 타입명을 표준화된 이름으로 변환
 */
export const normalizeSensorType = (dtype: string): string => {
  const type = dtype.toLowerCase();

  if (type.includes('water_temp') || type === 'water_temperature') return 'water_temp';
  if (type.includes('air_temp') || type === 'tmp' || type === '온도' || type === 'temperature') return 'temperature';
  if (type.includes('temp')) return 'temperature';
  if (type.includes('humid') || type === 'hum' || type === '습도') return 'humidity';
  if (type.includes('co2') || type === 'carbon') return 'co2';
  if (type.includes('ph')) return 'ph';
  if (type.includes('ec') || type.includes('conductivity')) return 'ec';
  if (type.includes('light') || type.includes('lux') || type === '조도') return 'light';
  if (type.includes('level') || type === '수위') return 'water_level';

  return type;
};

/**
 * 센서 타입별 설정
 */
export const SENSOR_CONFIG: Record<string, {
  icon: typeof Thermometer;
  unit: string;
  color: string;
  bgColor: string;
  chartColor: string;
  label: string;
}> = {
  temperature: { icon: Thermometer, unit: '°C', color: 'text-red-500', bgColor: 'bg-red-100', chartColor: '#ef4444', label: '기온' },
  water_temp: { icon: Thermometer, unit: '°C', color: 'text-orange-500', bgColor: 'bg-orange-100', chartColor: '#f97316', label: '수온' },
  humidity: { icon: Droplets, unit: '%', color: 'text-blue-500', bgColor: 'bg-blue-100', chartColor: '#3b82f6', label: '습도' },
  co2: { icon: Wind, unit: 'ppm', color: 'text-green-500', bgColor: 'bg-green-100', chartColor: '#22c55e', label: 'CO2' },
  light: { icon: Lightbulb, unit: 'lux', color: 'text-yellow-500', bgColor: 'bg-yellow-100', chartColor: '#eab308', label: '조도' },
  ph: { icon: Activity, unit: 'pH', color: 'text-purple-500', bgColor: 'bg-purple-100', chartColor: '#a855f7', label: 'pH' },
  ec: { icon: Activity, unit: 'mS/cm', color: 'text-indigo-500', bgColor: 'bg-indigo-100', chartColor: '#6366f1', label: 'EC' },
  water_level: { icon: Droplets, unit: 'cm', color: 'text-cyan-500', bgColor: 'bg-cyan-100', chartColor: '#06b6d4', label: '수위' },
};

/**
 * 센서 타입별 차트 색상
 */
export const CHART_COLORS: Record<string, string> = {
  temperature: '#ef4444',
  humidity: '#3b82f6',
  co2: '#22c55e',
  water_temp: '#f97316',
  ph: '#a855f7',
  ec: '#6366f1',
  light: '#eab308',
  water_level: '#06b6d4',
};

// ==================================================
// 컨트롤러 관련 설정
// ==================================================

/**
 * 컨트롤러 타입별 설정
 */
export const CONTROLLER_CONFIG: Record<string, {
  icon: typeof Power;
  color: string;
  bgColor: string;
  label: string;
}> = {
  led: { icon: Lightbulb, color: 'text-yellow-500', bgColor: 'bg-yellow-100', label: 'LED' },
  pump: { icon: Droplets, color: 'text-blue-500', bgColor: 'bg-blue-100', label: 'PUMP' },
  water: { icon: Droplets, color: 'text-cyan-500', bgColor: 'bg-cyan-100', label: 'WATER' },
  ac: { icon: Snowflake, color: 'text-indigo-500', bgColor: 'bg-indigo-100', label: 'AC' },
  heater: { icon: Thermometer, color: 'text-red-500', bgColor: 'bg-red-100', label: 'HEATER' },
  freezer: { icon: Snowflake, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'FREEZER' },
  humid: { icon: Wind, color: 'text-teal-500', bgColor: 'bg-teal-100', label: 'HUMID' },
  ventilator: { icon: Fan, color: 'text-green-500', bgColor: 'bg-green-100', label: 'VENTILATOR' },
  co2: { icon: Wind, color: 'text-emerald-500', bgColor: 'bg-emerald-100', label: 'CO2' },
  doser: { icon: Zap, color: 'text-purple-500', bgColor: 'bg-purple-100', label: 'DOSER' },
  switch: { icon: Power, color: 'text-gray-500', bgColor: 'bg-gray-100', label: 'SWITCH' },
};

// ==================================================
// 기간 옵션 (그래프용)
// ==================================================

export const PERIOD_OPTIONS = [
  { label: 'Today', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '7 Days', days: 7 },
  { label: '10 Days', days: 10 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
];
