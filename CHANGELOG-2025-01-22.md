# CubeOS-Next 작업 내역 (2025-01-22)

## 개요
CubeOS-Next 대시보드 UI 개선 및 인트로 페이지 제작

---

## 1. 대시보드 UI 개선

### 전체 평균 요약 카드
- 흰색 배경 + 테두리 추가로 시각적 구분 강화
- 라벨 스타일 정리 (uppercase, tracking-wide)

### 토글 스위치 오버플로 수정
- 토글 크기 조정 (`w-14` → `w-12`)
- `overflow-hidden` 추가
- `translate-x` 대신 `left` 포지셔닝 사용

---

## 2. 모바일 반응형 지원

### 대시보드 (`/dashboard`)
- 사이드바: 햄버거 메뉴 + 슬라이드 드로어 방식
- 사이트 목록: 모바일에서 드롭다운으로 변경
- 모든 카드 및 텍스트 반응형 처리 (`md:` breakpoints)

### 센서 모니터링 (`/sensors`)
- 모바일용 사이트 선택 드롭다운 추가
- 반응형 높이 계산 수정 (`h-[calc(100vh-56px)] lg:h-[calc(100vh-64px)]`)
- 게이트웨이 카드, 센서 요약 카드 반응형 처리
- 텍스트 `truncate` 추가로 오버플로 방지

### 컨트롤러 (`/controllers`)
- 모바일용 사이트 선택 드롭다운 추가
- 반응형 레이아웃 적용
- 토글 스위치 오버플로 수정

---

## 3. 데스크톱 UI 개선

### 접을 수 있는 사이드바
- `uiStore.ts` 생성 (Zustand + persist)
- 사이드바 접기/펼치기 토글 버튼 추가
- 접힌 상태에서 아이콘만 표시 (`w-64` ↔ `w-16`)
- localStorage에 상태 저장

### 접을 수 있는 사이트 패널
- 대시보드 사이트 패널 접기/펼치기 기능
- 접힌 상태에서 사이트명 3글자까지 표시

---

## 4. 인트로/랜딩 페이지 제작

### 디자인
- 다크 테마 (`bg-gray-950`)
- 블루 그리드 패턴 배경
- 글로우 효과 (블러 처리된 그라디언트)
- 그라디언트 텍스트 타이틀

### 섹션 구성
1. **헤더** - 로고 + 로그인 버튼
2. **히어로** - "Smart / Control System" 타이틀
3. **기술 스택 뱃지** - MQTT, REST API, IoT Gateway, Multi-Farm
4. **주요 기능** (6개)
   - 실시간 대시보드
   - 센서 모니터링
   - 스마트 제어
   - 레시피 관리
   - 데이터 분석
   - 접근 제어
5. **지원 센서/장비**
   - 센서 8종: 기온, 습도, CO2, pH, EC, 조도, 수온, 수위
   - 컨트롤러 7종: LED, Pump, AC, Heater, Ventilator, CO2, Doser
6. **아키텍처** - MQTT Protocol, Multi-Farm Support, Recipe Automation
7. **CTA** - 대시보드 이동 버튼
8. **푸터** - © 2024 N.THING Inc. All rights reserved.

---

## 5. 수정된 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `app/page.tsx` | 인트로 페이지 (리다이렉트 → 랜딩 페이지) |
| `app/(dashboard)/dashboard/page.tsx` | 대시보드 UI 개선, 모바일 반응형 |
| `app/(dashboard)/layout.tsx` | 사이드바 상태에 따른 동적 마진 |
| `app/(dashboard)/sensors/page.tsx` | 모바일 반응형 지원 |
| `app/(dashboard)/controllers/page.tsx` | 모바일 반응형 지원 |
| `components/layout/Sidebar.tsx` | 접을 수 있는 사이드바, 모바일 햄버거 메뉴 |
| `lib/uiStore.ts` | UI 상태 관리 스토어 (신규) |

---

## 6. 기술 스택

- **Framework**: Next.js 16.1, React 19.2
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand (persist middleware)
- **Icons**: Lucide React
- **Deployment**: Vercel

---

## 배포 URL

https://cubeos-next.vercel.app
