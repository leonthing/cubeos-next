# CubeOS-Next 작업 내역 (2025-01-22)

## 개요
설정 페이지 게이트웨이 관리 기능 개선 및 펌웨어 업데이트 UI 구현

---

## 주요 변경사항

### 1. 게이트웨이 관리 화면 개선 (`app/(dashboard)/settings/page.tsx`)

#### 테이블 뷰 구현
- 기존 CubeOS와 동일한 테이블 형식으로 변경
- 컬럼: STAT (상태), GNAME (게이트웨이 이름), GID (게이트웨이 ID), SNAME (사이트 이름)
- 센서/컨트롤러 게이트웨이 분리 표시

#### 상세 정보 패널
- 게이트웨이 선택 시 우측에 상세 정보 표시
- Firmware version, RSSI, Last update, Site Name, Position 정보
- 액션 버튼: Calibration (센서만), Blink, Delete

### 2. 사이트 관리 기능 개선

#### 사이트 편집
- 사이트 이름 수정 기능
- 사이트 타입 선택 (GROWING, GERMINATION, ENTRANCE, WORKING, PANTRY, TOILET, REST, LABORATORY, OUTSIDE)
- 알람 설정 토글

#### 사이트 삭제
- 삭제 확인 모달 추가
- 안전한 삭제 프로세스

### 3. 펌웨어 업데이트 기능 (UI 구현)

#### Firmware Update 모달
- "Firmware Update" 버튼 추가 (게이트웨이 탭 헤더)
- Firmware Status 테이블 (FID, VERSION, FILE SIZE)
- Update Firmware 버튼

#### Firmware Upload 섹션
- 파일 선택 (.bin 파일)
- 펌웨어 타입 선택 (afs, wfs, ofs, ctr_m, ctr_s)
- 펌웨어 버전 입력
- Upload & DB Update 버튼

> **참고**: 펌웨어 API 경로는 확인 후 연결 예정

---

## API 추가 (`lib/api.ts`)

### Gateway API 확장
```typescript
gatewayApi.blinkGateway(farmId, gatewayId)    // LED 깜빡임
gatewayApi.deleteGateway(farmId, gatewayId)   // 게이트웨이 삭제
gatewayApi.calibrateSensor(farmId, gatewayId) // 센서 캘리브레이션
```

### Site API 확장
```typescript
siteApi.updateSite(farmId, { sid, sname, stype }) // 사이트 정보 수정
siteApi.deleteSite(farmId, siteId)                // 사이트 삭제
```

### Firmware API (신규)
```typescript
firmwareApi.getFirmwares()                        // 펌웨어 목록 조회
firmwareApi.updateFirmware()                      // 펌웨어 업데이트
firmwareApi.uploadFirmware({ file, ftype, version }) // 펌웨어 업로드
firmwareApi.deleteFirmware(fid)                   // 펌웨어 삭제
```

---

## 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `app/(dashboard)/settings/page.tsx` | 게이트웨이 테이블 뷰, 사이트 편집/삭제, 펌웨어 모달 |
| `lib/api.ts` | Gateway, Site, Firmware API 함수 추가 |
| `app/(dashboard)/dashboard/page.tsx` | 기존 작업 (이전 세션) |
| `app/(dashboard)/logs/page.tsx` | 모바일 반응형 개선 |
| `app/(dashboard)/recipes/page.tsx` | 모바일 반응형 개선 |
| `components/layout/Sidebar.tsx` | 사이드바 개선 |
| `lib/uiStore.ts` | UI 상태 관리 |

---

## 배포 정보

- **URL**: https://cubeos-next.vercel.app
- **빌드**: 성공
- **배포**: Vercel Production

---

## 다음 작업 (TODO)

- [ ] 펌웨어 API 경로 확인 및 연결
- [ ] 브라우저 개발자 도구에서 기존 CubeOS 펌웨어 API 호출 확인 필요
