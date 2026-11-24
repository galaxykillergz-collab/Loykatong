import {
  collection,
  deleteDoc,
  doc,
  increment,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import {
  db,
  handleFirestoreError,
  isFirebaseConfigured,
  OperationType,
} from '@/src/firebase/config';
import {
  DEFAULT_BOARD_ID,
  KRATHONG_LIMITS,
  type KrathongDraft,
  type KrathongRecord,
} from '@/src/types/krathong';
import { isValidImageInput } from '@/src/utils/imageHelper';

const COLLECTION_NAME = 'krathongs';
const DEMO_STORAGE_KEY = 'loy_krathong_demo_records_v2';

export type StorageMode = 'firebase' | 'demo';

export function normalizeBoardId(raw?: string | null): string {
  const cleaned = (raw ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, KRATHONG_LIMITS.boardIdMax);
  if (cleaned.length >= KRATHONG_LIMITS.boardIdMin) {
    return cleaned;
  }
  return DEFAULT_BOARD_ID;
}

export function generateCoupleBoardId(): string {
  return `love-${Math.random().toString(36).slice(2, 8)}`;
}

const INITIAL_DEMO_KRATHONGS: KrathongRecord[] = [
  {
    id: 'demo_k1',
    boardId: DEFAULT_BOARD_ID,
    toName: 'น้องพลอย',
    fromName: 'พี่วิน',
    krathongStyle: 'pink-lotus',
    flowerColor: 'pastel-pink',
    candleColor: 'warm-gold',
    wishText: 'ขอให้อยู่ด้วยกันแบบนี้ไปทุกปีเลยนะ ไม่ว่าฤดูไหนก็ขอให้มีรอยยิ้มของเธออยู่ข้างๆ เสมอ',
    loveNote: 'ขอบคุณที่เป็นความสบายใจให้กันในทุกๆ วันนะ รักน้องพลอยที่สุดเลย 💕',
    imageData: '',
    heartsCount: 14,
    createdAt: Date.now() - 1000 * 60 * 48,
  },
  {
    id: 'demo_k2',
    boardId: DEFAULT_BOARD_ID,
    toName: 'ต้นกล้า',
    fromName: 'มินนี่',
    krathongStyle: 'banana-leaf',
    flowerColor: 'marigold-gold',
    candleColor: 'peach-amber',
    wishText: 'ขอให้สายน้ำพัดพาความเหนื่อยล้าจากการทำงานออกไป เหลือไว้แต่ความสุขและความสดใสให้เธอนะ',
    loveNote: 'ปีนี้ไม่ได้ไปลอยที่ท่าน้ำด้วยกัน แต่ใจเราอยู่ข้างๆ กันเสมอนะเจ้าเด็กดื้อ',
    imageData: '',
    heartsCount: 9,
    createdAt: Date.now() - 1000 * 60 * 31,
  },
  {
    id: 'demo_k3',
    boardId: DEFAULT_BOARD_ID,
    toName: 'ข้าวหอม',
    fromName: 'พีท',
    krathongStyle: 'sweet-macaron',
    flowerColor: 'lavender-mist',
    candleColor: 'rose-pink',
    wishText: 'ขอให้ความรักของเราหวานละมุนเหมือนมาการองใบนี้ และเติบโตไปด้วยกันอย่างอบอุ่นตลอดไป',
    loveNote: 'คืนนี้พระจันทร์สวยมาก แต่รอยยิ้มของข้าวหอมสวยกว่าเสมอเลยครับ',
    imageData: '',
    heartsCount: 18,
    createdAt: Date.now() - 1000 * 60 * 17,
  },
  {
    id: 'demo_k4',
    boardId: DEFAULT_BOARD_ID,
    toName: 'พี่ภูมิ',
    fromName: 'แพรว',
    krathongStyle: 'golden-royal',
    flowerColor: 'ivory-jasmine',
    candleColor: 'moonlight-blue',
    wishText: 'ขอให้สุขภาพแข็งแรง เดินทางปลอดภัยทุกเส้นทาง และสมหวังในทุกเรื่องที่ตั้งใจไว้นะคะ',
    loveNote: 'ดีใจที่ได้เจอและได้เดินข้างๆ พี่ภูมิในปีนี้นะคะ สุขสันต์วันลอยกระทงค่ะ 🌕',
    imageData: '',
    heartsCount: 11,
    createdAt: Date.now() - 1000 * 60 * 6,
  },
];

function generateSafeId(): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  const timePart = Date.now().toString(36);
  return `k_${timePart}_${randomPart}`;
}

export function sanitizeKrathongDraft(draft: KrathongDraft): KrathongDraft {
  const toName = draft.toName.trim().slice(0, KRATHONG_LIMITS.toNameMax);
  const fromName = draft.fromName.trim().slice(0, KRATHONG_LIMITS.fromNameMax);
  const wishText = draft.wishText.trim().slice(0, KRATHONG_LIMITS.wishTextMax);
  const loveNote = draft.loveNote.trim().slice(0, KRATHONG_LIMITS.loveNoteMax);
  const imageData = draft.imageData.trim();

  if (toName.length < KRATHONG_LIMITS.toNameMin) {
    throw new Error('กรุณากรอกชื่อคนพิเศษ (ผู้รับ)');
  }
  if (fromName.length < KRATHONG_LIMITS.fromNameMin) {
    throw new Error('กรุณากรอกชื่อของคุณ (ผู้ส่ง)');
  }
  if (wishText.length < KRATHONG_LIMITS.wishTextMin) {
    throw new Error('กรุณาเขียนคำอธิษฐานก่อนลอยกระทง');
  }
  if (!isValidImageInput(imageData)) {
    throw new Error('รูปภาพต้องเป็นลิงก์ https:// หรือไฟล์ภาพที่บีบอัดแล้วขนาดไม่เกิน 250KB');
  }

  return {
    ...draft,
    toName,
    fromName,
    wishText,
    loveNote,
    imageData,
  };
}

function readDemoRecords(): KrathongRecord[] {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_KRATHONGS));
      return INITIAL_DEMO_KRATHONGS;
    }
    const parsed = JSON.parse(raw) as KrathongRecord[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_KRATHONGS;
  } catch {
    return INITIAL_DEMO_KRATHONGS;
  }
}

function writeDemoRecords(records: KrathongRecord[]): void {
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota issues in demo mode
  }
}

const demoListeners = new Set<(records: KrathongRecord[]) => void>();

function notifyDemoListeners(records: KrathongRecord[]): void {
  demoListeners.forEach((cb) => cb(records));
}

export function getDefaultStorageMode(): StorageMode {
  return isFirebaseConfigured && db ? 'firebase' : 'demo';
}

export function subscribeKrathongs(
  mode: StorageMode,
  boardId: string,
  onData: (records: KrathongRecord[]) => void,
  onError: (err: Error) => void
): () => void {
  const safeBoardId = normalizeBoardId(boardId);

  if (mode === 'demo' || !db) {
    const filterAndSort = (all: KrathongRecord[]) =>
      all
        .filter((item) => (item.boardId || DEFAULT_BOARD_ID) === safeBoardId)
        .sort((a, b) => b.createdAt - a.createdAt);

    onData(filterAndSort(readDemoRecords()));
    const listener = (next: KrathongRecord[]) => {
      onData(filterAndSort(next));
    };
    demoListeners.add(listener);
    return () => {
      demoListeners.delete(listener);
    };
  }

  const colRef = collection(db, COLLECTION_NAME);
  // Single-field equality filter matches Firestore security rule `existing().boardId is string` without requiring a composite index
  const q = query(colRef, where('boardId', '==', safeBoardId), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: KrathongRecord[] = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          const ts = data.createdAt as Timestamp | undefined;
          const createdAtMs =
            ts && typeof ts.toMillis === 'function' ? ts.toMillis() : Date.now();
          return {
            id: docSnap.id,
            boardId: String(data.boardId ?? safeBoardId),
            toName: String(data.toName ?? ''),
            fromName: String(data.fromName ?? ''),
            krathongStyle: data.krathongStyle ?? 'banana-leaf',
            flowerColor: data.flowerColor ?? 'pastel-pink',
            candleColor: data.candleColor ?? 'warm-gold',
            wishText: String(data.wishText ?? ''),
            loveNote: String(data.loveNote ?? ''),
            imageData: String(data.imageData ?? ''),
            heartsCount: typeof data.heartsCount === 'number' ? data.heartsCount : 0,
            createdAt: createdAtMs,
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt);
      onData(records);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      } catch (wrappedError) {
        onError(
          wrappedError instanceof Error
            ? wrappedError
            : new Error('ไม่สามารถโหลดข้อมูลกระทงได้')
        );
      }
    }
  );
}

export async function createKrathong(
  mode: StorageMode,
  boardId: string,
  rawDraft: KrathongDraft
): Promise<KrathongRecord> {
  const safeBoardId = normalizeBoardId(boardId);
  const sanitized = sanitizeKrathongDraft(rawDraft);
  const id = generateSafeId();

  if (mode === 'demo' || !db) {
    const newRecord: KrathongRecord = {
      id,
      boardId: safeBoardId,
      ...sanitized,
      heartsCount: 0,
      createdAt: Date.now(),
    };
    const next = [newRecord, ...readDemoRecords()];
    writeDemoRecords(next);
    notifyDemoListeners(next);
    return newRecord;
  }

  const docPath = `${COLLECTION_NAME}/${id}`;
  try {
    await setDoc(doc(db, COLLECTION_NAME, id), {
      id,
      boardId: safeBoardId,
      toName: sanitized.toName,
      fromName: sanitized.fromName,
      krathongStyle: sanitized.krathongStyle,
      flowerColor: sanitized.flowerColor,
      candleColor: sanitized.candleColor,
      wishText: sanitized.wishText,
      loveNote: sanitized.loveNote,
      imageData: sanitized.imageData,
      heartsCount: 0,
      createdAt: serverTimestamp(),
    });
    return {
      id,
      boardId: safeBoardId,
      ...sanitized,
      heartsCount: 0,
      createdAt: Date.now(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function sendHeartToKrathong(
  mode: StorageMode,
  krathongId: string
): Promise<void> {
  if (mode === 'demo' || !db) {
    const current = readDemoRecords();
    const updated = current.map((item) =>
      item.id === krathongId
        ? { ...item, heartsCount: item.heartsCount + 1 }
        : item
    );
    writeDemoRecords(updated);
    notifyDemoListeners(updated);
    return;
  }

  const docPath = `${COLLECTION_NAME}/${krathongId}`;
  try {
    await updateDoc(doc(db, COLLECTION_NAME, krathongId), {
      heartsCount: increment(1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteKrathong(
  mode: StorageMode,
  krathongId: string
): Promise<void> {
  if (mode === 'demo' || !db) {
    const current = readDemoRecords();
    const updated = current.filter((item) => item.id !== krathongId);
    writeDemoRecords(updated);
    notifyDemoListeners(updated);
    return;
  }

  const docPath = `${COLLECTION_NAME}/${krathongId}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, krathongId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

