// ==================================================
// CubeOS 인트로/랜딩 페이지
// 프로페셔널 & 테크니컬 디자인
// ==================================================

import Link from 'next/link';
import {
  LayoutDashboard,
  Thermometer,
  Power,
  BookOpen,
  Wifi,
  Shield,
  Building2,
  BarChart3,
  Zap,
  Leaf,
  Activity,
  Cpu,
  Database,
  GitBranch,
  ArrowRight,
} from 'lucide-react';

// 주요 기능 목록
const features = [
  {
    icon: LayoutDashboard,
    title: '실시간 대시보드',
    description: '모든 농장의 환경 데이터를 한눈에 모니터링하고 즉각 대응',
  },
  {
    icon: Thermometer,
    title: '센서 모니터링',
    description: '온도, 습도, CO2, pH, EC 등 8종 센서 실시간 데이터 수집',
  },
  {
    icon: Power,
    title: '스마트 제어',
    description: 'LED, 펌프, 환기팬, 에어컨 등 7종 장비 원격 제어',
  },
  {
    icon: BookOpen,
    title: '레시피 관리',
    description: '작물별 최적 재배 환경 레시피 설정 및 자동 적용',
  },
  {
    icon: BarChart3,
    title: '데이터 분석',
    description: '센서 로그 기반 트렌드 분석 및 이력 관리',
  },
  {
    icon: Shield,
    title: '접근 제어',
    description: 'Master, Manager, User 역할별 세분화된 권한 관리',
  },
];

// 기술 스택
const techStack = [
  { icon: Activity, label: 'MQTT', desc: '실시간 통신' },
  { icon: Database, label: 'REST API', desc: '데이터 연동' },
  { icon: Cpu, label: 'IoT Gateway', desc: '장비 제어' },
  { icon: GitBranch, label: 'Multi-Farm', desc: '다중 농장' },
];

// 지원 센서 타입
const sensors = [
  { name: '기온', unit: '°C' },
  { name: '습도', unit: '%' },
  { name: 'CO2', unit: 'ppm' },
  { name: 'pH', unit: 'pH' },
  { name: 'EC', unit: 'mS/cm' },
  { name: '조도', unit: 'lux' },
  { name: '수온', unit: '°C' },
  { name: '수위', unit: 'cm' },
];

// 지원 컨트롤러 타입
const controllers = [
  'LED', 'Pump', 'AC', 'Heater', 'Ventilator', 'CO2', 'Doser'
];

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* 배경 그리드 패턴 */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      {/* 그라디언트 오버레이 */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-950/50 via-transparent to-gray-950 pointer-events-none" />

      {/* 헤더 */}
      <header className="relative z-50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold">cubeOS</span>
            </div>
            <Link
              href="/auth/login"
              className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all border border-white/10 hover:border-white/20"
            >
              로그인
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* 글로우 효과 */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[128px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-8">
            <Leaf className="w-4 h-4" />
            <span>Modular Vertical Farm OS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
            <span className="text-white">Smart</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Control System
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            실시간 센서 모니터링, 원격 장비 제어, 재배 레시피 관리.
            <br className="hidden sm:block" />
            수직농장 운영을 위한 통합 플랫폼.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/login"
              className="group w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2"
            >
              <span>시작하기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg border border-white/10 hover:border-white/20 transition-all"
            >
              기능 살펴보기
            </Link>
          </div>

          {/* 기술 스택 뱃지 */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
            {techStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <div
                  key={tech.label}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-gray-300">{tech.label}</span>
                  <span className="text-xs text-gray-500">{tech.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-cyan-400 text-sm font-semibold tracking-wide uppercase mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              핵심 기능
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              스마트팜 운영에 필요한 모든 기능을 하나의 플랫폼에서
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-6 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl transition-all duration-300"
                >
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:border-blue-500/40 transition-colors">
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 센서 & 컨트롤러 섹션 */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* 센서 */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Sensors</h3>
                  <p className="text-sm text-gray-500">8종 센서 지원</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sensors.map((sensor) => (
                  <div
                    key={sensor.name}
                    className="bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 rounded-lg p-3 text-center transition-colors"
                  >
                    <p className="font-medium text-white text-sm">{sensor.name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{sensor.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 컨트롤러 */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
                  <Power className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Controllers</h3>
                  <p className="text-sm text-gray-500">7종 장비 제어</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {controllers.map((name) => (
                  <div
                    key={name}
                    className="bg-white/[0.02] border border-white/5 hover:border-purple-500/30 rounded-lg p-3 text-center transition-colors"
                  >
                    <p className="font-medium text-white text-sm">{name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 아키텍처 섹션 */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-cyan-400 text-sm font-semibold tracking-wide uppercase mb-3">Architecture</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              시스템 구성
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative p-6 bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10 rounded-xl">
              <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-bl-lg rounded-tr-xl">
                Real-time
              </div>
              <Wifi className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">MQTT Protocol</h3>
              <p className="text-gray-500 text-sm">
                실시간 양방향 통신으로 센서 데이터 수신 및 장비 제어 명령 전송
              </p>
            </div>

            <div className="relative p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 rounded-xl">
              <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-bl-lg rounded-tr-xl">
                Scalable
              </div>
              <Building2 className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Farm Support</h3>
              <p className="text-gray-500 text-sm">
                여러 농장을 하나의 플랫폼에서 통합 관리하고 농장별 권한 분리
              </p>
            </div>

            <div className="relative p-6 bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/10 rounded-xl">
              <div className="absolute top-0 right-0 px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-bl-lg rounded-tr-xl">
                Automated
              </div>
              <Zap className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Recipe Automation</h3>
              <p className="text-gray-500 text-sm">
                작물별 재배 레시피 기반 자동 제어로 최적의 생육 환경 유지
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-8 sm:p-12 bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-emerald-600/10 border border-white/10 rounded-2xl overflow-hidden">
            {/* 글로우 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                시작할 준비가 되셨나요?
              </h2>
              <p className="text-gray-400 mb-8">
                cubeOS로 스마트팜 운영의 새로운 경험을 시작하세요.
              </p>
              <Link
                href="/auth/login"
                className="group inline-flex items-center space-x-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span>대시보드로 이동</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="relative py-8 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-white">cubeOS</span>
          </div>
          <p className="text-sm text-gray-600">
            © 2024 N.THING Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
