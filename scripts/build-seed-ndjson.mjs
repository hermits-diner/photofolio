/**
 * Turns the starter sessions in src/data/seed.ts into a dataset the Studio can
 * import, so a brand-new Sanity project opens with working sheets rather
 * than an empty list. Images ride along via `_sanityAsset`, which the import
 * command resolves and uploads.
 *
 *   node scripts/build-seed-ndjson.mjs
 *   npx sanity dataset import sanity-seed.ndjson production
 *
 * Import is additive — running it twice creates duplicates. Use
 * `--replace` if you mean to overwrite.
 *
 * The seed is TypeScript with erasable-only syntax, which node imports
 * directly since 23.6 — no compiler involved.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const { identity, sessions } = await import(
  pathToFileURL(path.join(root, "src", "data", "seed.ts")).href
);

const docs = [];

docs.push({
  _id: "siteSettings",
  _type: "siteSettings",
  alias: identity.alias,
  aliasLatin: identity.aliasLatin,
  city: identity.city,
  statement:
    "거리에서 찍습니다. 대부분은 버리고, 남은 것만 여기에 둡니다. 이름은 밝히지 않습니다.",
  email: identity.email,
  instagram: identity.instagram,
  commissionNote: "작업에 대한 이야기와 질문은 이메일로 받습니다.",
});

for (const session of sessions) {
  const photoIds = [];

  for (const [i, frame] of session.frames.entries()) {
    const id = `seed-${session.number}-frame-${String(i + 1).padStart(2, "0")}`;
    photoIds.push(id);

    docs.push({
      _id: id,
      _type: "photo",
      frameRef: frame.frameRef,
      alt: frame.alt,
      caption: frame.caption,
      place: frame.place,
      // The seed writes dates as 2026.03.04; Sanity's date type wants ISO.
      shotAt: frame.shotAt ? frame.shotAt.replaceAll(".", "-") : undefined,
      lens: frame.lens,
      aperture: frame.aperture,
      shutter: frame.shutter,
      iso: frame.iso,
      select: frame.select === true,
      slug: { _type: "slug", current: id },
      image: {
        _type: "image",
        _sanityAsset: `image@${pathToFileURL(path.join(root, "public", frame.src)).href}`,
      },
    });
  }

  docs.push({
    _id: `seed-sheet-${session.number}`,
    _type: "series",
    title: session.title,
    titleLatin: session.titleLatin,
    slug: { _type: "slug", current: `sheet-${session.number}` },
    sheetNumber: session.number,
    genre: session.genre,
    location: session.location,
    camera: session.camera,
    lenses: session.lenses,
    shotOver: session.shotOver,
    publishedAt: session.publishedAt,
    frames: photoIds.map((id) => ({ _key: id, _type: "reference", _ref: id })),
  });
}

// ── Book & show drafts ──────────────────────────────────────────────────
// The selects, per sheet in shot order — the natural pool for a book or a
// show. Both drafts exist so the Studio opens with the workflow visible,
// not as finished work.

const ref = (id) => ({ _type: "reference", _ref: id });
const selectsBySheet = new Map(
  sessions.map((session) => [
    session.number,
    session.frames.flatMap((frame, i) =>
      frame.select ? [`seed-${session.number}-frame-${String(i + 1).padStart(2, "0")}`] : [],
    ),
  ]),
);
const allSelects = [...selectsBySheet.values()].flat();

const spreads = [];
for (let i = 0; i < allSelects.length; i += 2) {
  spreads.push({
    _key: `spread-${String(i / 2 + 1).padStart(2, "0")}`,
    _type: "spread",
    left: ref(allSelects[i]),
    ...(allSelects[i + 1] ? { right: ref(allSelects[i + 1]) } : {}),
    ...(allSelects[i + 1] ? {} : { note: "홀수로 남은 컷 — 마지막 펼침면은 한쪽을 백면으로" }),
  });
}

docs.push({
  _id: "seed-book-001",
  _type: "photobook",
  title: "거리 파일 1집",
  titleLatin: "Street File Vol. 1",
  slug: { _type: "slug", current: "book-001" },
  status: "editing",
  statement: "세 시트의 셀렉트를 한 권으로 묶는 첫 에디트. 페어링은 아직 가안입니다.",
  cover: ref(allSelects[0]),
  candidates: allSelects.map((id) => ({ _key: id, _type: "reference", _ref: id })),
  spreads,
  trimWidth: 210,
  trimHeight: 260,
  paper: "몽블랑 130g",
  binding: "사철",
  copies: 100,
  productionLog: [
    {
      _key: "log-01",
      _type: "logEntry",
      date: "2026-07-20",
      event: "에디트 시작 — 셀렉트를 풀에 모음",
    },
  ],
});

docs.push({
  _id: "seed-exhibition-001",
  _type: "exhibition",
  title: "밤으로 가는 길",
  titleLatin: "Toward Night",
  slug: { _type: "slug", current: "toward-night" },
  statement: "시트 037의 셀렉트를 처음 벽에 거는 소규모 전시. 공간을 알아보는 중입니다.",
  works: (selectsBySheet.get("037") ?? []).map((id) => ({
    _key: `work-${id}`,
    _type: "work",
    photo: ref(id),
    printSize: "40×50cm",
    paper: "하네뮬레 포토랙 308g",
    frame: "무광 알루미늄 흑색",
    edition: "1/7",
  })),
  checklist: [
    "공간 섭외 — 후보 세 곳 답사",
    "테스트 프린트 — 용지 두 종 비교",
    "액자 견적 비교",
    "포스터·엽서 인쇄",
    "오프닝 준비",
    "철수·반출 계획",
  ].map((task, i) => ({
    _key: `task-${String(i + 1).padStart(2, "0")}`,
    _type: "task",
    task,
    done: false,
  })),
  budget: ["프린트", "액자", "대관료", "인쇄물"].map((item, i) => ({
    _key: `budget-${String(i + 1).padStart(2, "0")}`,
    _type: "budgetItem",
    item,
  })),
  // 공개일 없음 — 사이트에 나오지 않는 준비 중 상태 그대로.
});

const out = path.join(root, "sanity-seed.ndjson");
await writeFile(out, docs.map((d) => JSON.stringify(d)).join("\n") + "\n");

console.log(`${docs.length} documents -> sanity-seed.ndjson`);
console.log("다음: npx sanity dataset import sanity-seed.ndjson production");
