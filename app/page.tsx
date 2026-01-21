// ==================================================
// CubeOS 인트로/랜딩 페이지
// ==================================================

import Link from 'next/link';
import {
  LayoutDashboard,
  Thermometer,
  Power,
  BookOpen,
  FileText,
  Settings,
  Wifi,
  Shield,
  Building2,
  BarChart3,
  Zap,
  Leaf,
} from 'lucide-react';

// 주요 기능 목록
const features = [
  {
    icon: LayoutDashboard,
    title: '실시간 대시보드',
    description: '모든 농장의 환경 데이터를 한눈에 모니터링',
    color: 'bg-blue-500',
  },
  {
    icon: Thermometer,
    title: '센서 모니터링',
    description: '온도, 습도, CO2, pH, EC 등 다양한 센서 데이터 실시간 확인',
    color: 'bg-red-500',
  },
  {
    icon: Power,
    title: '스마트 제어',
    description: 'LED, 펌프, 환기팬, 에어컨 등 원격 장비 제어',
    color: 'bg-purple-500',
  },
  {
    icon: BookOpen,
    title: '레시피 관리',
    description: '작물별 최적 재배 환경 레시피 설정 및 관리',
    color: 'bg-green-500',
  },
  {
    icon: BarChart3,
    title: '데이터 분석',
    description: '센서 데이터 기반 트렌드 분석 및 그래프 시각화',
    color: 'bg-orange-500',
  },
  {
    icon: Shield,
    title: '역할 기반 접근',
    description: '관리자, 농장장, 사용자별 세분화된 권한 관리',
    color: 'bg-indigo-500',
  },
];

// 지원 센서 타입
const sensors = [
  { name: '기온', unit: '°C', icon: '🌡️' },
  { name: '습도', unit: '%', icon: '💧' },
  { name: 'CO2', unit: 'ppm', icon: '🌿' },
  { name: 'pH', unit: 'pH', icon: '🧪' },
  { name: 'EC', unit: 'mS/cm', icon: '⚡' },
  { name: '조도', unit: 'lux', icon: '💡' },
  { name: '수온', unit: '°C', icon: '🌊' },
  { name: '수위', unit: 'cm', icon: '📏' },
];

// 지원 컨트롤러 타입
const controllers = [
  { name: 'LED', icon: '💡' },
  { name: 'Pump', icon: '💧' },
  { name: 'AC', icon: '❄️' },
  { name: 'Heater', icon: '🔥' },
  { name: 'Ventilator', icon: '🌀' },
  { name: 'CO2', icon: '🌿' },
  { name: 'Doser', icon: '💉' },
];

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">cubeOS</span>
            </div>
            <Link
              href="/auth/login"
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              로그인
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-6">
            <Leaf className="w-4 h-4" />
            <span>모듈형 수직농장 운영 시스템</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            스마트팜을 위한
            <br />
            <span className="text-blue-600">통합 모니터링 플랫폼</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            실시간 센서 모니터링, 원격 장비 제어, 재배 레시피 관리까지.
            <br className="hidden sm:block" />
            cubeOS로 스마트팜 운영을 더 쉽고 효율적으로.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              시작하기
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto px-8 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              기능 살펴보기
            </Link>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              주요 기능
            </h2>
            <p className="text-lg text-gray-600">
              스마트팜 운영에 필요한 모든 기능을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 border border-transparent hover:border-gray-100"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 센서 & 컨트롤러 섹션 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 센서 */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">지원 센서</h3>
              </div>
              <p className="text-gray-600 mb-6">
                다양한 환경 센서를 통해 농장의 상태를 실시간으로 모니터링합니다.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sensors.map((sensor) => (
                  <div
                    key={sensor.name}
                    className="bg-white border border-gray-100 rounded-xl p-3 text-center hover:border-green-200 hover:bg-green-50/50 transition-colors"
                  >
                    <span className="text-xl mb-1 block">{sensor.icon}</span>
                    <p className="font-medium text-gray-900 text-sm">{sensor.name}</p>
                    <p className="text-xs text-gray-400">{sensor.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 컨트롤러 */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Power className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">지원 장비</h3>
              </div>
              <p className="text-gray-600 mb-6">
                LED부터 양액 도저까지 다양한 장비를 원격으로 제어할 수 있습니다.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {controllers.map((controller) => (
                  <div
                    key={controller.name}
                    className="bg-white border border-gray-100 rounded-xl p-3 text-center hover:border-purple-200 hover:bg-purple-50/50 transition-colors"
                  >
                    <span className="text-xl mb-1 block">{controller.icon}</span>
                    <p className="font-medium text-gray-900 text-sm">{controller.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              왜 cubeOS인가?
            </h2>
            <p className="text-gray-400 text-lg">
              효율적인 스마트팜 운영을 위한 핵심 기능
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">실시간 연동</h3>
              <p className="text-gray-400">
                MQTT 프로토콜을 통한 실시간 센서 데이터 수신 및 장비 제어
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">다중 농장 지원</h3>
              <p className="text-gray-400">
                여러 농장을 하나의 플랫폼에서 통합 관리
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">자동화 지원</h3>
              <p className="text-gray-400">
                레시피 기반 자동 제어로 최적의 재배 환경 유지
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            cubeOS로 스마트팜 운영의 새로운 경험을 시작해보세요.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            <span>로그인하고 대시보드로 이동</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-gray-900">cubeOS</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2024 cubeOS. 모듈형 수직농장 모니터링/운영 시스템
          </p>
        </div>
      </footer>
    </div>
  );
}
