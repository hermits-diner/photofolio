/**
 * One roll, in the order it was shot. Frame numbers follow 35mm edge
 * numbering (1, 1A, 2, 2A …) because the sheet is a record of a sequence —
 * the order is information, not decoration.
 *
 * Placeholder content: replace `photographer`, `roll`, and every frame's
 * scan + EXIF with the real ones. Drop scans in public/roll/ at 3:2.
 */

export type Frame = {
  /** Edge number as it prints on the film rebate. */
  edge: string;
  src: string;
  /** Describes the picture for someone who cannot see it. */
  alt: string;
  caption: string;
  place: string;
  shotAt: string;
  lens: string;
  aperture: string;
  shutter: string;
  /** Circled in chinagraph on the sheet — the frames worth printing. */
  select?: boolean;
};

export const photographer = {
  name: "노은재",
  latin: "Noh Eunjae",
  city: "Seoul",
  email: "studio@noheunjae.kr",
  instagram: "@noh.darkroom",
} as const;

export const roll = {
  number: "037",
  stock: "Kodak 5063 TX",
  rated: "ISO 400, pushed to 1600",
  developer: "HC-110 dil. B, 9분 20℃",
  shotOver: "2026년 3월 — 4월",
} as const;

export const frames: Frame[] = [
  {
    edge: "1",
    src: "/roll/frame-01.jpg",
    alt: "가로등 아래 젖은 아스팔트에 번지는 빛",
    caption: "비 온 뒤 골목",
    place: "회현동",
    shotAt: "2026.03.04",
    lens: "35mm",
    aperture: "f/2",
    shutter: "1/60",
  },
  {
    edge: "1A",
    src: "/roll/frame-02.jpg",
    alt: "지하철 승강장의 흐릿한 인파",
    caption: "환승 통로",
    place: "충무로",
    shotAt: "2026.03.04",
    lens: "35mm",
    aperture: "f/2.8",
    shutter: "1/30",
  },
  {
    edge: "2",
    src: "/roll/frame-03.jpg",
    alt: "창틀에 걸린 늦은 오후의 역광",
    caption: "빈 사무실",
    place: "을지로3가",
    shotAt: "2026.03.11",
    lens: "50mm",
    aperture: "f/1.4",
    shutter: "1/125",
    select: true,
  },
  {
    edge: "2A",
    src: "/roll/frame-04.jpg",
    alt: "하얗게 날아간 하늘과 옥상 난간",
    caption: "옥상",
    place: "신당동",
    shotAt: "2026.03.11",
    lens: "50mm",
    aperture: "f/8",
    shutter: "1/500",
  },
  {
    edge: "3",
    src: "/roll/frame-05.jpg",
    alt: "커튼 사이로 들어온 빛이 벽에 만든 띠",
    caption: "오후 네 시",
    place: "성북동",
    shotAt: "2026.03.19",
    lens: "50mm",
    aperture: "f/2",
    shutter: "1/250",
  },
  {
    edge: "3A",
    src: "/roll/frame-06.jpg",
    alt: "어두운 실내에서 창을 향해 선 사람의 실루엣",
    caption: "기다리는 사람",
    place: "성북동",
    shotAt: "2026.03.19",
    lens: "50mm",
    aperture: "f/1.4",
    shutter: "1/60",
  },
  {
    edge: "4",
    src: "/roll/frame-07.jpg",
    alt: "안개 낀 강변의 옅은 회색 풍경",
    caption: "새벽 강",
    place: "망원",
    shotAt: "2026.03.28",
    lens: "85mm",
    aperture: "f/4",
    shutter: "1/250",
    select: true,
  },
  {
    edge: "4A",
    src: "/roll/frame-08.jpg",
    alt: "가로수 그림자가 드리운 보도블록",
    caption: "가로수길",
    place: "연희동",
    shotAt: "2026.03.28",
    lens: "35mm",
    aperture: "f/5.6",
    shutter: "1/500",
  },
  {
    edge: "5",
    src: "/roll/frame-09.jpg",
    alt: "밤의 지하 주차장, 형광등 한 줄만 켜진 장면",
    caption: "지하 2층",
    place: "종로",
    shotAt: "2026.04.02",
    lens: "35mm",
    aperture: "f/2",
    shutter: "1/15",
  },
  {
    edge: "5A",
    src: "/roll/frame-10.jpg",
    alt: "테이블 위 유리컵에 맺힌 반사광",
    caption: "닫기 전",
    place: "익선동",
    shotAt: "2026.04.02",
    lens: "50mm",
    aperture: "f/1.4",
    shutter: "1/30",
    select: true,
  },
  {
    edge: "6",
    src: "/roll/frame-11.jpg",
    alt: "흐린 날 아파트 단지의 평평한 회색 톤",
    caption: "단지",
    place: "상계동",
    shotAt: "2026.04.14",
    lens: "85mm",
    aperture: "f/5.6",
    shutter: "1/250",
  },
  {
    edge: "6A",
    src: "/roll/frame-12.jpg",
    alt: "롤 마지막 컷, 빛이 새어 들어온 가장자리",
    caption: "롤 끝",
    place: "상계동",
    shotAt: "2026.04.14",
    lens: "85mm",
    aperture: "f/4",
    shutter: "1/125",
  },
];
