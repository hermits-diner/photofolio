# 사진가 포트폴리오 — 컨택트시트

흑백 필름 사진가의 포트폴리오 사이트. 페이지 전체가 라이트테이블 위에 놓인 **컨택트시트 한 장**이라는 전제로 만들어졌습니다.

- 밝은 인화지 바탕 위에, 프레임은 검은 레베이트(필름 여백) 필드 안에 놓입니다
- 프레임 번호는 35mm 엣지 넘버링(1, 1A, 2, 2A…)을 그대로 씁니다 — 롤에서의 순서가 실제 정보이기 때문입니다
- 인화할 컷에는 차이나그래프(유성연필) 동그라미가 그려집니다. 빨강은 이 용도로만 씁니다
- 스크롤해서 도달하면 프레임이 현상액 속 잠상처럼 옅은 상태에서 제 계조로 올라옵니다

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4.

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드
npm run lint
```

## 내 사진으로 바꾸기

1. `public/roll/` 에 스캔을 넣습니다. **3:2 비율**(35mm)을 전제로 레이아웃이 잡혀 있습니다.
2. `src/data/roll.ts` 에서 아래를 수정합니다.
   - `photographer` — 이름, 도시, 연락처
   - `roll` — 롤 번호, 필름, 현상 정보
   - `frames` — 각 컷의 파일 경로, `alt`(화면 낭독기용 설명), 캡션, EXIF. 인화할 컷에 `select: true`
3. 공유 카드에 쓸 축소본을 만듭니다.
   ```bash
   node scripts/generate-placeholders.mjs   # 임시 이미지를 쓰는 동안만
   ```
   실제 스캔으로 바꿨다면 `public/roll/thumbs/` 에 같은 이름으로 216×144 축소본을 넣으면 됩니다.

> **이미지를 교체했는데 옛 사진이 보인다면** Next.js 이미지 옵티마이저 캐시입니다. `rm -rf .next/cache/images` 후 재시작하세요.

현재 들어 있는 사진은 `scripts/generate-placeholders.mjs` 가 생성한 임시 이미지이고, 이름·연락처도 전부 플레이스홀더입니다.

## 배포 전에

`src/app/layout.tsx` 의 `metadataBase` 가 환경변수를 읽습니다. 공유 카드(OG 이미지)가 절대경로로 잡히도록 실제 도메인을 넣어주세요.

```bash
NEXT_PUBLIC_SITE_URL=https://example.com
```

## 구조

| 경로 | 역할 |
|---|---|
| `src/app/page.tsx` | 히어로 · 시트 · 콜로폰 |
| `src/app/layout.tsx` | 서체 5종, 메타데이터 |
| `src/app/globals.css` | 색·서체 토큰, `develop` 애니메이션 |
| `src/app/opengraph-image.tsx` | 공유 카드 (빌드 시 생성) |
| `src/components/contact-sheet.tsx` | 시트 그리드 + 라이트박스 |
| `src/components/smooth-scroll.tsx` | Lenis 래퍼 |
| `src/data/roll.ts` | **사진·정보는 전부 여기** |
| `scripts/` | 임시 이미지 · 파비콘 생성기 |

### 서체

| 역할 | 라틴 | 한글 |
|---|---|---|
| 디스플레이 | Barlow Condensed | Gothic A1 |
| 본문 | Newsreader | 나눔명조 |
| 데이터 | Spline Sans Mono | Gothic A1 |

라틴을 앞에 두고 한글을 뒤에 두어 브라우저가 글자 단위로 폴백합니다. `assets/BarlowCondensed-Medium.ttf` 는 OG 이미지 생성 전용입니다 (OFL).

## 접근성

키보드만으로 모든 프레임에 접근·확대·닫기가 되고, 포커스 링이 보이며, `prefers-reduced-motion` 에서 현상 애니메이션이 꺼집니다. 프레임을 바꿀 때 `alt` 를 꼭 함께 써주세요.
