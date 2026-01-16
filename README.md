# cubeOS Next.js

모듈형 수직농장 모니터링/운영 플랫폼 - 신규 프론트엔드

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사해서 `.env.local` 파일을 만들고, 실제 값을 입력하세요:

```bash
cp .env.example .env.local
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 📁 프로젝트 구조

```
cubeos-next/
├── app/                      # Next.js App Router
│   ├── (dashboard)/          # 대시보드 영역 (인증 필요)
│   │   ├── dashboard/        # 메인 대시보드
│   │   ├── sensors/          # 센서 모니터링
│   │   ├── controllers/      # 컨트롤러 제어
│   │   ├── logs/             # 로그 조회
│   │   └── settings/         # 설정
│   ├── auth/                 # 인증 페이지
│   │   └── login/            # 로그인
│   ├── layout.tsx            # 루트 레이아웃
│   └── page.tsx              # 루트 페이지
├── components/               # React 컴포넌트
│   ├── layout/               # 레이아웃 컴포넌트
│   ├── ui/                   # 공통 UI 컴포넌트
│   ├── dashboard/            # 대시보드 관련
│   ├── sensors/              # 센서 관련
│   └── controllers/          # 컨트롤러 관련
├── lib/                      # 유틸리티 및 라이브러리
│   ├── api.ts                # API 클라이언트
│   └── authStore.ts          # 인증 상태 관리
├── hooks/                    # React 커스텀 훅
│   └── useMqtt.ts            # MQTT 연동 훅
├── types/                    # TypeScript 타입 정의
│   ├── auth.ts               # 인증 관련 타입
│   └── farm.ts               # 농장/장치 관련 타입
└── styles/                   # 스타일
    └── globals.css           # 전역 스타일
```

---

## 🔧 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS |
| 상태관리 | Zustand |
| 데이터 페칭 | React Query, Axios |
| 실시간 통신 | MQTT.js |
| 차트 | Recharts |
| 아이콘 | Lucide React |

---

## 🔌 기존 시스템 연동

이 프로젝트는 기존 cubeOS 백엔드 API를 그대로 활용합니다:

- **API 서버**: `https://api.nthing.link:8080`
- **MQTT 브로커**: `wss://mqtt.nthing.link:8084/mqtt`

### API 연동 구조

```
새 프론트엔드 (Next.js)
       ↓
기존 백엔드 API (Spring Boot)
       ↓
기존 MQTT 브로커 (EMQX)
       ↓
하드웨어 (센서/컨트롤러)
```

---

## 📝 개발 가이드

### 새 페이지 추가하기

1. `app/(dashboard)/` 아래에 폴더 생성
2. `page.tsx` 파일 작성
3. 필요시 `Sidebar.tsx`에 메뉴 추가

### API 호출하기

```typescript
import { siteApi, deviceApi } from '@/lib/api';

// 사이트 목록 조회
const sites = await siteApi.getSites(farmId);

// 장치 제어
await deviceApi.ledControl(farmId, { did: 'device-id', switch: true });
```

### MQTT 데이터 수신하기

```typescript
import { useMqtt } from '@/hooks/useMqtt';

const { isConnected } = useMqtt({
  farmId: 'seoul',
  onSensorData: (gatewayId, data) => {
    console.log('센서 데이터:', data);
  },
});
```

---

## 🚧 개발 현황

- [x] 프로젝트 구조 설정
- [x] 인증 시스템 (로그인/로그아웃)
- [x] 대시보드 기본 레이아웃
- [x] API 클라이언트
- [x] MQTT 연동
- [ ] 센서 상세 페이지
- [ ] 컨트롤러 제어 페이지
- [ ] 로그 조회 페이지
- [ ] 설정 페이지
- [ ] 알림 시스템

---

## 📞 문의

문제가 있거나 도움이 필요하면 연락주세요.
