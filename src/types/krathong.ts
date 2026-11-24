export type KrathongStyle =
  | 'banana-leaf'
  | 'pink-lotus'
  | 'sweet-macaron'
  | 'golden-royal';

export type FlowerColor =
  | 'pastel-pink'
  | 'marigold-gold'
  | 'lavender-mist'
  | 'ivory-jasmine'
  | 'coral-rose';

export type CandleColor =
  | 'warm-gold'
  | 'rose-pink'
  | 'moonlight-blue'
  | 'peach-amber';

export const DEFAULT_BOARD_ID = 'shared-river';

export interface KrathongRecord {
  id: string;
  boardId: string;
  toName: string;
  fromName: string;
  krathongStyle: KrathongStyle;
  flowerColor: FlowerColor;
  candleColor: CandleColor;
  wishText: string;
  loveNote: string;
  imageData: string;
  heartsCount: number;
  createdAt: number;
}

export interface KrathongDraft {
  toName: string;
  fromName: string;
  krathongStyle: KrathongStyle;
  flowerColor: FlowerColor;
  candleColor: CandleColor;
  wishText: string;
  loveNote: string;
  imageData: string;
}

// Synchronized verbatim with firebase-blueprint.json bounds
export const KRATHONG_LIMITS = {
  boardIdMin: 3,
  boardIdMax: 64,
  toNameMin: 1,
  toNameMax: 60,
  fromNameMin: 1,
  fromNameMax: 60,
  wishTextMin: 1,
  wishTextMax: 400,
  loveNoteMax: 600,
  imageDataMax: 250000,
} as const;

export const KRATHONG_STYLE_OPTIONS: {
  id: KrathongStyle;
  label: string;
  subtitle: string;
}[] = [
  {
    id: 'banana-leaf',
    label: 'ใบตองคลาสสิก',
    subtitle: 'กลีบใบตองพับประณีตแต่งดอกไม้',
  },
  {
    id: 'pink-lotus',
    label: 'ดอกบัวชมพู',
    subtitle: 'กลีบบัวละมุนบานรับแสงจันทร์',
  },
  {
    id: 'sweet-macaron',
    label: 'ขนมปังมาการอง',
    subtitle: 'กระทงรักษ์โลกสีหวานน่ารัก',
  },
  {
    id: 'golden-royal',
    label: 'กลีบผกาครีมทอง',
    subtitle: 'โทนครีมอุ่นประดับทองอ่อนละไม',
  },
];

export const FLOWER_COLOR_OPTIONS: {
  id: FlowerColor;
  label: string;
  primaryHex: string;
  secondaryHex: string;
}[] = [
  {
    id: 'pastel-pink',
    label: 'ชมพูพาสเทล',
    primaryHex: '#F7A8C4',
    secondaryHex: '#FDE2EC',
  },
  {
    id: 'marigold-gold',
    label: 'เหลืองดาวเรือง',
    primaryHex: '#F7C948',
    secondaryHex: '#FEF3C7',
  },
  {
    id: 'lavender-mist',
    label: 'ม่วงลาเวนเดอร์',
    primaryHex: '#C4A7F7',
    secondaryHex: '#EDE9FE',
  },
  {
    id: 'ivory-jasmine',
    label: 'ขาวมะลินวล',
    primaryHex: '#FFF8EC',
    secondaryHex: '#E2E8F0',
  },
  {
    id: 'coral-rose',
    label: 'กุหลาบพีช',
    primaryHex: '#FB8C8C',
    secondaryHex: '#FFE4E6',
  },
];

export const CANDLE_COLOR_OPTIONS: {
  id: CandleColor;
  label: string;
  flameHex: string;
  glowHex: string;
  stickHex: string;
}[] = [
  {
    id: 'warm-gold',
    label: 'แสงเทียนทองอบอุ่น',
    flameHex: '#FCD34D',
    glowHex: '#F59E0B',
    stickHex: '#FEF3C7',
  },
  {
    id: 'rose-pink',
    label: 'แสงเทียนชมพูหวาน',
    flameHex: '#F9A8D4',
    glowHex: '#EC4899',
    stickHex: '#FCE7F3',
  },
  {
    id: 'moonlight-blue',
    label: 'แสงเทียนฟ้าจันทร์',
    flameHex: '#93C5FD',
    glowHex: '#60A5FA',
    stickHex: '#DBEAFE',
  },
  {
    id: 'peach-amber',
    label: 'แสงเทียนส้มละมุน',
    flameHex: '#FDBA74',
    glowHex: '#FB923C',
    stickHex: '#FFEDD5',
  },
];

export const WISH_PRESETS: string[] = [
  'ขอให้อยู่ด้วยกันแบบนี้ไปทุกปีเลยนะ',
  'ขอให้เธอมีความสุขมากๆ ในทุกวัน และยิ้มเยอะๆ นะ',
  'ขอให้ความรักของเรามั่นคง อบอุ่น และเข้าใจกันตลอดไป',
  'ขอให้สายน้ำพัดพาความเหนื่อยล้าออกไป เหลือไว้แต่เรื่องดีๆ ให้เธอ',
];

export const LOVE_NOTE_PRESETS: string[] = [
  'ขอบคุณที่เป็นความสบายใจให้กันในทุกๆ วันนะ รักเธอที่สุดเลย',
  'ต่อให้ปีหน้าหรืออีกกี่ปี ก็อยากมาลอยกระทงข้างๆ เธอคนเดิมนี่แหละ',
  'ไม่ว่าจะเหนื่อยแค่ไหน หันมาก็ยังเจอเราอยู่ตรงนี้เสมอนะ',
  'คืนนี้พระจันทร์สวยมาก แต่รอยยิ้มของเธอสวยกว่าเสมอ',
];
