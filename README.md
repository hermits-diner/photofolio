# 거리 사진 포트폴리오 — 컨택트시트

익명으로 운영하는 디지털 사진가의 포트폴리오. 페이지 전체가 라이트테이블 위에 놓인 **컨택트시트**라는 전제로 만들어졌습니다.

컨택트시트의 본질은 *에디트* — 다 찍어놓고 살릴 컷을 고르는 일이고, 스트리트는 에디트가 전부인 장르입니다. 필름이든 카드든 그 행위는 같아서, 시트는 가져오되 필름 화학은 가져오지 않았습니다.

- 밝은 종이 바탕 위에, 프레임은 검은 필드 안에 놓입니다
- 프레임을 부르는 이름은 **카메라가 붙인 파일 번호**(DSCF1043)입니다. 실제로 작업할 때 쓰는 유일한 식별자입니다
- 셀렉트에는 동그라미가 그려집니다. 빨강은 이 용도로만 씁니다
- 스크롤해서 도달하면 프레임이 프리뷰가 풀리듯 옅은 상태에서 제 계조로 올라옵니다

**필름 용어는 의도적으로 없습니다.** 필름·현상액·롤 번호·35mm 엣지 넘버는 디지털 사진가에게 거짓이라 전부 빼고, 바디·렌즈·실제 EXIF로 바꿨습니다.

**본명이 들어가는 자리도 없습니다.** 스키마에 이름 필드 자체가 없고, 표지에는 활동명만 들어갑니다.

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Sanity.

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드
npm run lint
```

## 사진 관리 — Sanity 연결

콘텐츠는 **Sanity**에서 관리합니다. 관리 화면은 별도 호스팅 없이 이 앱의 `/studio` 에 들어 있습니다.

연결 전까지 사이트는 `src/data/seed.ts` 의 임시 데이터로 동작하고, `/studio` 는 설정 안내를 보여줍니다. 이 분기는 `src/content.ts` 한 곳에만 있습니다.

### 처음 한 번

```bash
npx sanity login                    # 브라우저가 열립니다
npx sanity init --env .env.local    # 프로젝트를 만들고 값을 채워줍니다
```

`.env.local` 에 `NEXT_PUBLIC_SANITY_PROJECT_ID` 가 생기면 연결된 것입니다. 항목은 `.env.example` 을 참고하세요.

이어서 지금의 예시 시트를 그대로 옮겨두면 빈 화면에서 시작하지 않아도 됩니다.

```bash
node scripts/build-seed-ndjson.mjs
npx sanity dataset import sanity-seed.ndjson production
```

> 이 import 는 **추가**입니다. 두 번 실행하면 문서가 중복됩니다.

### 그다음부터

`npm run dev` 후 [/studio](http://localhost:3000/studio) 에서 작업합니다.

| 문서 | 하는 일 |
|---|---|
| **사이트 설정** | 활동명·지역·소개·연락처. 문서 하나만 존재합니다 |
| **시리즈** | 주제 하나 = 컨택트시트 한 장. 프레임을 끌어서 순서를 바꾸면 시트도 그대로 바뀝니다 |
| **프레임** | 사진 한 장. 업로드하면 EXIF·블러 플레이스홀더·색상이 자동으로 추출됩니다 |

**시리즈는 `공개일` 이 비어 있으면 사이트에 나오지 않습니다.** 작업 중인 세션을 숨겨두는 방법입니다.

스트리트 외의 작업은 시리즈의 `분야` 로 구분됩니다. 인물이든 여행이든 시트 한 장씩 만들면 목록에서 분야·지역이 함께 보입니다.

`대체 텍스트` 는 필수입니다 — 사진을 볼 수 없는 사람에게 장면을 설명하는 문장이지, 캡션의 복사본이 아닙니다.

### 익명 유지

- 스키마에 본명 필드가 없습니다. `이름 대신 쓸 것` 에 활동명이나 프로젝트명을 넣으세요
- 이메일은 본명이 드러나지 않는 주소를 쓰세요. 현재 `hello@example.com` 은 플레이스홀더입니다
- `주 활동 지역` 은 비워둬도 동작합니다. 도시까지만 적는 편이 안전합니다
- 사진 파일의 EXIF에 GPS나 소유자 정보가 남아 있을 수 있습니다. **업로드 전에 확인하세요** — Sanity는 EXIF를 그대로 읽어 저장합니다

### 판매 필드

프레임의 `판매 대상`·`이용 조건 메모` 는 스키마에만 있고 **사이트에서는 아직 아무 일도 하지 않습니다.** 결제·주문·다운로드 권한을 붙일 때 쓰려고 자리만 잡아둔 것입니다.

## 배포 전에

`.env` 에 실제 도메인을 넣어야 공유 카드(OG 이미지)가 절대경로로 잡힙니다.

```bash
NEXT_PUBLIC_SITE_URL=https://example.com
```

> **사진을 바꿨는데 옛 이미지가 보인다면** Next.js 이미지 옵티마이저 캐시입니다. `rm -rf .next/cache/images` 후 재시작하세요.

## 구조

| 경로 | 역할 |
|---|---|
| `src/content.ts` | **Sanity ↔ 임시 데이터 분기는 여기 하나뿐** |
| `src/sanity/schemaTypes/` | 관리 화면의 입력 항목 정의 |
| `src/sanity/lib/queries.ts` | GROQ 쿼리 |
| `sanity.config.ts` | Studio 설정 (사이드바 구성 포함) |
| `src/app/(site)/page.tsx` | 시리즈 목록 |
| `src/app/(site)/series/[slug]/` | 컨택트시트 한 장 |
| `src/app/studio/` | 관리 화면. `(site)` 밖이라 Lenis가 닿지 않습니다 |
| `src/app/globals.css` | 색·서체 토큰, `resolve` 애니메이션 |
| `src/lib/og-card.tsx` | 공유 카드 (빌드 시 생성) |
| `src/components/contact-sheet.tsx` | 시트 그리드 + 라이트박스 |
| `src/data/seed.ts` | 임시 데이터. Sanity 연결 후에는 시드 생성에만 쓰입니다 |
| `scripts/` | 임시 이미지 · 파비콘 · 시드 생성기 |

### 서체

| 역할 | 라틴 | 한글 |
|---|---|---|
| 디스플레이 | Barlow Condensed | Gothic A1 |
| 본문 | Newsreader | 나눔명조 |
| 데이터 | Spline Sans Mono | Gothic A1 |

라틴을 앞에 두고 한글을 뒤에 두어 브라우저가 글자 단위로 폴백합니다. `assets/BarlowCondensed-Medium.ttf` 는 OG 이미지 생성 전용입니다 (OFL).

## 접근성

키보드만으로 모든 프레임에 접근·확대·닫기가 되고, 포커스 링이 보이며, `prefers-reduced-motion` 에서 프레임 등장 애니메이션이 꺼집니다. 프레임을 바꿀 때 `alt` 를 꼭 함께 써주세요.
