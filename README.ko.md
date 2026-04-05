# AACA - AI-Agent 중심 아키텍처

> 레이어드를 넘어서. 헥사고날을 넘어서. AI Agent 시대를 위한 아키텍처.

[![npm version](https://img.shields.io/npm/v/create-aaca)](https://www.npmjs.com/package/create-aaca)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[English README](./README.md)

기존 소프트웨어 아키텍처(레이어드, 헥사고날, 클린)는 **인간의 인지 능력**에 맞춰 설계되었습니다 — 작은 파일, 암묵적 관례, 추상화 레이어. AACA는 **AI Agent의 인지 능력**에 맞춰 설계되었습니다 — 명시적 매니페스트, 자기 완결적 모듈, 결정론적 탐색.

---

## AI Agent라면

다음 파일을 순서대로 읽으세요:

```
1. SYSTEM.manifest.yaml   → 시스템이 하는 일 (operations, capabilities, infrastructure)
2. GLOSSARY.yaml           → 도메인 용어 정의
3. DECISIONS.yaml          → 지켜야 할 제약 조건
4. operations/{name}/MODULE.manifest.yaml → 파일 목록, 의존성, 변경 영향 범위
5. operations/{name}/CONTEXT.md           → 수정할 것과 하지 말 것
6. contracts/{name}.contract.yaml         → 입력/출력/에러/부수 효과
7. operations/{name}/RATIONALE.md         → 비즈니스 규칙의 이유
```

이 7개 파일을 읽으면 **완전한 컨텍스트**를 확보합니다. 탐색 불필요.

### 일반 작업 빠른 참조

| 작업 | 시작 지점 |
|------|----------|
| 새 기능 추가 | `SYSTEM.manifest.yaml` → `_aaca/templates/new-operation/` |
| 버그 수정 | `SYSTEM.manifest.yaml` → 해당 operation → `MODULE.manifest.yaml` |
| 새 API 엔드포인트 추가 | `entry-points/http/routes.manifest.yaml` → 새 operation 생성 |
| 비즈니스 규칙 변경 | operation의 `logic.{ext}` (`RATIONALE.md` 먼저 확인) |
| 데이터베이스 테이블 추가 | `infrastructure/{db}/CONTEXT.md` |
| 에러 이해하기 | operation의 `errors.{ext}` + `contract.yaml` |

### AI Agent 규칙

1. `MODULE.manifest.yaml` 의존성을 확인하지 않고 **대상 operation 디렉토리 외부 파일을 수정하지 마세요**
2. 변경 구현 전 **항상 contract를 읽으세요**
3. 파일 추가/삭제 시 **`MODULE.manifest.yaml`을 업데이트하세요**
4. operation 추가/삭제 시 **`SYSTEM.manifest.yaml`을 업데이트하세요**
5. 아키텍처 선택 전 **`DECISIONS.yaml`을 확인하세요**

---

## 인간 개발자라면

### AACA란?

AACA는 코드를 **기술 레이어**(controller/service/repository)가 아닌 **시스템이 하는 일**(operation) 기준으로 조직합니다. 각 operation은 이해에 필요한 모든 것을 포함하는 자기 완결적 디렉토리입니다.

```
# 기존 방식 ("주문 생성"을 이해하려면 7개 디렉토리의 7개 파일)
controllers/OrderController.ts
services/OrderService.ts
repositories/OrderRepository.ts
models/Order.ts
dto/CreateOrderRequest.ts
dto/CreateOrderResponse.ts
mappers/OrderMapper.ts

# AACA (1개 디렉토리에 모든 것)
operations/create-order/
  ├── CONTEXT.md              # 이 모듈이 하는 일, 언제 수정하는지
  ├── MODULE.manifest.yaml    # 모든 파일, 의존성, 변경 영향
  ├── RATIONALE.md            # 결정의 이유
  ├── handler.ts              # 진입점
  ├── logic.ts                # 순수 비즈니스 로직
  ├── persistence.ts          # 데이터 접근
  ├── types.ts                # 이 operation 전용 타입
  ├── errors.ts               # 이 operation 전용 에러
  └── *.test.ts               # 동일 위치 테스트
```

### 7대 원칙

| # | 원칙 | 의미 |
|---|------|------|
| 1 | **Manifest Over Convention** | 이름이나 폴더 위치에 의존하지 않습니다. 모든 것을 YAML 매니페스트로 선언합니다. |
| 2 | **Context At Every Level** | 모든 디렉토리에 목적을 설명하는 `CONTEXT.md`가 있습니다. |
| 3 | **Operations Over Layers** | 기술적 역할이 아닌 시스템이 하는 일 기준으로 조직합니다. |
| 4 | **Contracts Before Code** | 구현 전에 contract에서 입력/출력/에러를 정의합니다. |
| 5 | **Self-Contained Modules** | 하나의 디렉토리 = 필요한 모든 것. 디렉토리 간 보물찾기 없음. |
| 6 | **Explicit Change Boundaries** | `MODULE.manifest.yaml`이 각 요구사항 유형별로 어떤 파일이 변경되는지 정확히 알려줍니다. |
| 7 | **Rationale As Code** | 설계 결정이 위키나 Slack이 아닌 저장소 안에 있습니다. |

### 빠른 시작

```bash
# 새 AACA 프로젝트 생성
npx create-aaca init my-service --lang typescript

# 프로젝트 구조 검증
npx create-aaca validate

# 새 operation 추가
npx create-aaca add-operation my-new-feature
```

### 프로젝트 구조

```
my-service/
├── SYSTEM.manifest.yaml      # 시스템 진입점 (여기서 시작)
├── CONTEXT.md                 # 프로젝트 레벨 컨텍스트
├── DECISIONS.yaml             # 아키텍처 결정 사항
├── GLOSSARY.yaml              # 도메인 용어
│
├── contracts/                 # 모든 모듈 간 contract
│   └── {name}.contract.yaml
│
├── operations/                # operation별 하나의 디렉토리
│   └── {name}/
│       ├── MODULE.manifest.yaml
│       ├── CONTEXT.md
│       ├── RATIONALE.md
│       ├── handler.{ext}
│       ├── logic.{ext}
│       └── *.test.{ext}
│
├── capabilities/              # 횡단 관심사 (인증, 이벤트 등)
│   └── {name}/
│
├── infrastructure/            # 외부 시스템 바인딩 (DB, 큐)
│   └── {name}/
│
├── entry-points/              # HTTP, CLI, 이벤트, 스케줄
│   └── {type}/
│
└── _aaca/                     # 검증 도구와 템플릿
    ├── validate.{ext}
    └── templates/
```

---

## 왜 AACA인가?

### AI Agent를 위해
- **결정론적 탐색**: 7개 파일, 항상 같은 위치, 항상 같은 형식
- **트라이벌 날리지 불필요**: 모든 것이 선언되고, 암묵적인 것이 없음
- **정확한 변경 범위**: 매니페스트가 각 요구사항 유형별 변경 사항을 정확히 선언
- **Contract 기반**: 완전한 에러 카탈로그, 부수 효과 선언, 불변 조건

### 인간 개발자를 위해
- **기능 응집**: "주문 생성"에 관한 모든 것이 `operations/create-order/`에
- **온보딩 속도**: `SYSTEM.manifest.yaml`을 읽으면 전체 시스템을 파악
- **안전한 리팩토링**: Contract와 매니페스트가 브레이킹 체인지를 감지
- **살아있는 문서**: `RATIONALE.md`와 `DECISIONS.yaml`이 항상 최신 상태

### 기존 아키텍처와 비교

| 관점 | 클린/헥사고날 | Vertical Slice | AACA |
|------|-------------|----------------|------|
| 조직 방식 | 기술 레이어 | 기능 폴더 | Operation + 매니페스트 |
| 탐색 | 탐색 & 추론 | 탐색 & 추론 | 결정론적 프로토콜 |
| 컨텍스트 | 외부 문서 | README 정도 | 모든 곳에 CONTEXT.md |
| Contract | 코드 내 인터페이스 | 표준 없음 | 에러/부수효과 포함 YAML 스키마 |
| 변경 영향 | 의존성 추적 | 추측 | 매니페스트에 선언 |
| 근거 | ADR 문서 (아마도) | 표준 없음 | operation별 RATIONALE.md |

---

## 예제

완전한 TypeScript 구현은 [`examples/order-service/`](./examples/order-service/)를 참고하세요.

## 문서

- [철학 & 원칙](./docs/philosophy.md)
- [시작하기](./docs/getting-started.md)
- [매니페스트 사양](./docs/manifests.md)
- [Contract 사양](./docs/contracts.md)
- [기존 아키텍처와 비교](./docs/vs-existing.md)
- [FAQ](./docs/faq.md)

## 설치

### 1. CLI 도구 (npx)

```bash
# 새 AACA 프로젝트 생성
npx create-aaca init my-service --lang typescript

# 기존 프로젝트에 operation 추가
npx create-aaca add-operation checkout

# 프로젝트 구조 검증
npx create-aaca validate
```

### 2. Claude Code Skill

```bash
# 방법 A: npx로 자동 설치
npx create-aaca install-skill

# 방법 B: 수동 복사
cp skill/SKILL.md ~/.claude/skills/aaca.md
```

설치 후 Claude Code에서 `/aaca`를 입력하면 됩니다.

### 3. 기여자를 위해

```bash
git clone https://github.com/khj68/create-aaca.git
cd create-aaca
npm install
npm run build
npm publish    # 'create-aaca'로 npm에 배포
```

## 기여

[CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.

## 라이선스

MIT
