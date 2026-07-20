/**
 * One session, in the order it was shot — a contact sheet is a record of an
 * edit, and the order is part of the record.
 *
 * Frames are identified by the filename the camera wrote, because that is
 * the real artifact a digital photographer works from. Nothing here invents
 * a film stock or a developer; the material facts are the body and the lens.
 *
 * Placeholder content. Everything moves to Sanity once a project is
 * connected — see README. The site runs anonymously by design: there is no
 * field anywhere for a legal name.
 */

export type SeedFrame = {
  /** As written by the camera: DSCF1043, _DSC4821, IMG_0912 … */
  frameRef: string;
  src: string;
  /** Describes the picture for someone who cannot see it. */
  alt: string;
  caption: string;
  place: string;
  shotAt: string;
  lens: string;
  aperture: string;
  shutter: string;
  iso: string;
  /** Survived the edit. */
  select?: boolean;
};

/** No name, by design — the byline slot holds the project, not a person. */
export const identity = {
  alias: "거리 파일",
  aliasLatin: "Street File",
  city: "Seoul",
  email: "hello@example.com",
  instagram: "@your.handle",
} as const;

export const session = {
  number: "037",
  genre: "스트리트",
  location: "서울 중구",
  camera: "Fujifilm X100V",
  lenses: "23mm 고정",
  shotOver: "2026년 3월 — 4월",
} as const;

export const frames: SeedFrame[] = [
  {
    frameRef: "DSCF1043",
    src: "/roll/frame-01.jpg",
    alt: "가로등 아래 젖은 아스팔트에 번지는 빛",
    caption: "비 온 뒤 골목",
    place: "회현동",
    shotAt: "2026.03.04",
    lens: "23mm",
    aperture: "f/2",
    shutter: "1/60",
    iso: "1600",
  },
  {
    frameRef: "DSCF1051",
    src: "/roll/frame-02.jpg",
    alt: "지하철 승강장의 흐릿한 인파",
    caption: "환승 통로",
    place: "충무로",
    shotAt: "2026.03.04",
    lens: "23mm",
    aperture: "f/2.8",
    shutter: "1/30",
    iso: "3200",
  },
  {
    frameRef: "DSCF1088",
    src: "/roll/frame-03.jpg",
    alt: "창틀에 걸린 늦은 오후의 역광",
    caption: "빈 사무실",
    place: "을지로3가",
    shotAt: "2026.03.11",
    lens: "23mm",
    aperture: "f/4",
    shutter: "1/125",
    iso: "400",
    select: true,
  },
  {
    frameRef: "DSCF1094",
    src: "/roll/frame-04.jpg",
    alt: "하얗게 날아간 하늘과 옥상 난간",
    caption: "옥상",
    place: "신당동",
    shotAt: "2026.03.11",
    lens: "23mm",
    aperture: "f/8",
    shutter: "1/500",
    iso: "160",
  },
  {
    frameRef: "DSCF1130",
    src: "/roll/frame-05.jpg",
    alt: "커튼 사이로 들어온 빛이 벽에 만든 띠",
    caption: "오후 네 시",
    place: "성북동",
    shotAt: "2026.03.19",
    lens: "23mm",
    aperture: "f/2",
    shutter: "1/250",
    iso: "320",
  },
  {
    frameRef: "DSCF1136",
    src: "/roll/frame-06.jpg",
    alt: "어두운 실내에서 창을 향해 선 사람의 실루엣",
    caption: "기다리는 사람",
    place: "성북동",
    shotAt: "2026.03.19",
    lens: "23mm",
    aperture: "f/2",
    shutter: "1/60",
    iso: "2500",
  },
  {
    frameRef: "DSCF1201",
    src: "/roll/frame-07.jpg",
    alt: "안개 낀 강변의 옅은 회색 풍경",
    caption: "새벽 강",
    place: "망원",
    shotAt: "2026.03.28",
    lens: "23mm",
    aperture: "f/5.6",
    shutter: "1/250",
    iso: "200",
    select: true,
  },
  {
    frameRef: "DSCF1215",
    src: "/roll/frame-08.jpg",
    alt: "가로수 그림자가 드리운 보도블록",
    caption: "가로수길",
    place: "연희동",
    shotAt: "2026.03.28",
    lens: "23mm",
    aperture: "f/5.6",
    shutter: "1/500",
    iso: "160",
  },
  {
    frameRef: "DSCF1263",
    src: "/roll/frame-09.jpg",
    alt: "밤의 지하 주차장, 형광등 한 줄만 켜진 장면",
    caption: "지하 2층",
    place: "종로",
    shotAt: "2026.04.02",
    lens: "23mm",
    aperture: "f/2",
    shutter: "1/15",
    iso: "6400",
  },
  {
    frameRef: "DSCF1271",
    src: "/roll/frame-10.jpg",
    alt: "테이블 위 유리컵에 맺힌 반사광",
    caption: "닫기 전",
    place: "익선동",
    shotAt: "2026.04.02",
    lens: "23mm",
    aperture: "f/2",
    shutter: "1/30",
    iso: "3200",
    select: true,
  },
  {
    frameRef: "DSCF1340",
    src: "/roll/frame-11.jpg",
    alt: "흐린 날 아파트 단지의 평평한 회색 톤",
    caption: "단지",
    place: "상계동",
    shotAt: "2026.04.14",
    lens: "23mm",
    aperture: "f/5.6",
    shutter: "1/250",
    iso: "200",
  },
  {
    frameRef: "DSCF1352",
    src: "/roll/frame-12.jpg",
    alt: "해질 무렵 건물 사이로 마지막 빛이 들어온 골목",
    caption: "마지막 컷",
    place: "상계동",
    shotAt: "2026.04.14",
    lens: "23mm",
    aperture: "f/4",
    shutter: "1/125",
    iso: "400",
  },
];
