import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Heart,
  Sparkles,
  Compass,
  BookHeart,
  PenTool,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { LovePostcardSection } from '@/src/components/LovePostcardSection';
import { NightRiverCanvas } from '@/src/components/NightRiverCanvas';
import { KrathongCustomizer } from '@/src/components/KrathongCustomizer';
import { KrathongDetailModal } from '@/src/components/KrathongDetailModal';
import { MemoryGallery } from '@/src/components/MemoryGallery';
import { FirebaseGuideModal } from '@/src/components/FirebaseGuideModal';
import {
  checkIsAdminUser,
  signInWithGoogle,
  signOutUser,
  subscribeAuthState,
} from '@/src/firebase/config';
import {
  createKrathong,
  deleteKrathong,
  generateCoupleBoardId,
  getDefaultStorageMode,
  normalizeBoardId,
  sendHeartToKrathong,
  subscribeKrathongs,
  type StorageMode,
} from '@/src/services/krathongService';
import {
  DEFAULT_BOARD_ID,
  type KrathongDraft,
  type KrathongRecord,
} from '@/src/types/krathong';
import { ambientAudio } from '@/src/utils/ambientAudio';

type SectionId = 'postcard' | 'river' | 'customizer' | 'gallery';

const INITIAL_DRAFT: KrathongDraft = {
  toName: '',
  fromName: '',
  krathongStyle: 'pink-lotus',
  flowerColor: 'pastel-pink',
  candleColor: 'warm-gold',
  wishText: '',
  loveNote: '',
  imageData: '',
};

function getInitialBoardIdFromUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_BOARD_ID;
  const params = new URLSearchParams(window.location.search);
  return normalizeBoardId(params.get('room'));
}

function formatFriendlyError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;
  const msg = err.message;
  if (msg.startsWith('{')) {
    try {
      const parsed = JSON.parse(msg) as { error?: string };
      if (parsed.error?.includes('Missing or insufficient permissions')) {
        return 'สิทธิ์การทำรายการถูกปฏิเสธ กรุณาตรวจสอบข้อมูลหรือสิทธิ์แอดมินอีกครั้ง';
      }
      if (parsed.error?.includes('Quota exceeded')) {
        return 'โควต้าการใช้งานฐานข้อมูลวันนี้เต็มแล้ว กรุณาลองสลับเป็นโหมดตัวอย่างชั่วคราว';
      }
      return parsed.error || fallback;
    } catch {
      return fallback;
    }
  }
  return msg || fallback;
}

async function copyTextSafe(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to textarea fallback
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function AppContent() {
  const [storageMode, setStorageMode] = useState<StorageMode>(() =>
    getDefaultStorageMode()
  );
  const [boardId, setBoardId] = useState<string>(() => getInitialBoardIdFromUrl());
  const [krathongs, setKrathongs] = useState<KrathongRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isFirebaseAdmin, setIsFirebaseAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [draft, setDraft] = useState<KrathongDraft>(INITIAL_DRAFT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newlyLaunchedId, setNewlyLaunchedId] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const postcardRef = useRef<HTMLDivElement | null>(null);
  const riverRef = useRef<HTMLDivElement | null>(null);
  const customizerRef = useRef<HTMLDivElement | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4800);
  };

  // Subscribe to Firebase Google Auth state & verify admin role
  useEffect(() => {
    const unsubscribe = subscribeAuthState((user) => {
      setUserEmail(user?.email ?? null);
      if (!user) {
        setIsFirebaseAdmin(false);
        return;
      }
      void checkIsAdminUser(user).then((adminOk) => {
        setIsFirebaseAdmin(adminOk);
      });
    });
    return () => unsubscribe();
  }, []);

  // Real-time subscription (Firestore onSnapshot or Demo LocalStorage) scoped to boardId
  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    const unsubscribe = subscribeKrathongs(
      storageMode,
      boardId,
      (records) => {
        setKrathongs(records);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        setLoadError(
          'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ในขณะนี้ ลองสลับเป็นโหมดตัวอย่างเพื่อทดลองใช้งานได้ทันที'
        );
        console.error(err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [storageMode, boardId]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      ambientAudio.stop();
    };
  }, []);

  const selectedKrathong = useMemo(
    () => krathongs.find((k) => k.id === selectedId) ?? null,
    [krathongs, selectedId]
  );

  // In Demo mode, allow testing delete locally; in Firebase mode, enforce verified Google Admin
  const effectiveIsAdmin = storageMode === 'demo' || isFirebaseAdmin;

  const scrollToSection = (section: SectionId) => {
    const map: Record<SectionId, React.RefObject<HTMLDivElement | null>> = {
      postcard: postcardRef,
      river: riverRef,
      customizer: customizerRef,
      gallery: galleryRef,
    };
    map[section].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updateRoomInUrl = (nextBoardId: string) => {
    const url = new URL(window.location.href);
    if (nextBoardId === DEFAULT_BOARD_ID) {
      url.searchParams.delete('room');
    } else {
      url.searchParams.set('room', nextBoardId);
    }
    window.history.replaceState({}, '', url.toString());
    return url.toString();
  };

  const handleShareRoom = async () => {
    const url = updateRoomInUrl(boardId);
    const copied = await copyTextSafe(url);
    if (copied) {
      showToast('คัดลอกลิงก์แล้ว ส่งให้แฟนเปิดลอยกระทงด้วยกันได้เลย 💕');
    } else {
      showToast(`แชร์ลิงก์นี้ให้แฟน: ${url}`);
    }
  };

  const handleCreateCoupleRoom = async () => {
    const nextRoom = generateCoupleBoardId();
    setBoardId(nextRoom);
    const url = updateRoomInUrl(nextRoom);
    const copied = await copyTextSafe(url);
    showToast(
      copied
        ? 'สร้างห้องส่วนตัวคู่รักและคัดลอกลิงก์แล้ว ส่งให้แฟนได้เลย 💕'
        : `สร้างห้องส่วนตัวคู่รัก (${nextRoom}) แล้ว`
    );
  };

  const handleReturnSharedRoom = () => {
    setBoardId(DEFAULT_BOARD_ID);
    updateRoomInUrl(DEFAULT_BOARD_ID);
    showToast('กลับสู่สายน้ำส่วนกลางคืนวันเพ็ญแล้ว');
  };

  const handleToggleAudio = () => {
    if (isAudioPlaying) {
      ambientAudio.stop();
      setIsAudioPlaying(false);
    } else {
      const started = ambientAudio.start();
      setIsAudioPlaying(started);
      if (!started) {
        showToast('เบราว์เซอร์ของคุณไม่รองรับการเล่นเสียงอัตโนมัติ');
      }
    }
  };

  const handleSignInGoogle = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const user = await signInWithGoogle();
      if (storageMode !== 'firebase') {
        setStorageMode('firebase');
      }
      const adminOk = await checkIsAdminUser(user);
      setIsFirebaseAdmin(adminOk);
      if (user.displayName) {
        setDraft((prev) =>
          prev.fromName.trim() ? prev : { ...prev, fromName: user.displayName ?? '' }
        );
      }
      showToast(
        adminOk
          ? `เข้าสู่ระบบแอดมิน (${user.email}) สำเร็จแล้ว`
          : `เข้าสู่ระบบด้วย ${user.email} แล้ว (บัญชีนี้ไม่มีสิทธิ์แอดมิน)`
      );
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : '';
      let message =
        'เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาอนุญาตป๊อปอัปแล้วลองใหม่อีกครั้ง';
      if (rawMsg.includes('popup-closed-by-user')) {
        message = 'ยกเลิกการเข้าสู่ระบบด้วย Google';
      } else if (rawMsg.includes('popup-blocked')) {
        message = 'เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาตป๊อปอัปสำหรับเว็บนี้แล้วกดลองใหม่';
      } else if (rawMsg.includes('unauthorized-domain')) {
        message = 'โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Auth (Authorized Domains)';
      } else if (rawMsg.includes('operation-not-allowed')) {
        message = 'ยังไม่ได้เปิดใช้งาน Google Sign-In ใน Firebase Authentication Console';
      } else if (rawMsg) {
        message = `เข้าสู่ระบบไม่สำเร็จ: ${rawMsg}`;
      }
      setAuthError(message);
      showToast(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signOutUser();
      setIsFirebaseAdmin(false);
      showToast('ออกจากระบบแอดมินแล้ว');
    } catch {
      setAuthError('ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFloatKrathong = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const created = await createKrathong(storageMode, boardId, draft);
      ambientAudio.playLaunchChime(isAudioPlaying);
      setNewlyLaunchedId(created.id);
      setDraft((prev) => ({
        ...prev,
        wishText: '',
        loveNote: '',
        imageData: '',
      }));
      scrollToSection('river');
      showToast(`ปล่อยกระทงถึง "${created.toName}" ลงสู่สายน้ำแล้ว 🌕`);
      window.setTimeout(() => {
        setNewlyLaunchedId((curr) => (curr === created.id ? null : curr));
      }, 9000);
    } catch (err) {
      setSubmitError(
        formatFriendlyError(
          err,
          'เกิดข้อผิดพลาดในการลอยกระทง กรุณาลองใหม่อีกครั้ง'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendHeart = async (krathongId: string) => {
    try {
      await sendHeartToKrathong(storageMode, krathongId);
      ambientAudio.playHeartPluck(isAudioPlaying);
    } catch (err) {
      showToast('ส่งหัวใจไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      console.error(err);
    }
  };

  const handleDeleteKrathong = async (krathongId: string) => {
    try {
      await deleteKrathong(storageMode, krathongId);
      if (selectedId === krathongId) {
        setSelectedId(null);
      }
      showToast('ลบกระทงออกจากสายน้ำเรียบร้อยแล้ว');
    } catch (err) {
      showToast(
        formatFriendlyError(
          err,
          'ลบกระทงไม่สำเร็จ กรุณาตรวจสอบสิทธิ์แอดมินของคุณ'
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1024] text-[#F8F3EC] pb-20 md:pb-8">
      {/* Sticky Top Bar (Strict 3-zone contract) */}
      <header className="sticky top-0 z-40 h-14 sm:h-16 bg-[#0B1024]/85 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line brand wordmark */}
          <a
            href="#postcard"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('postcard');
            }}
            className="font-display text-lg sm:text-xl font-semibold tracking-tight text-[#FFF8F0] whitespace-nowrap shrink-0"
          >
            คืนเพ็ญแห่งรัก
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="เมนูหลัก"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#CBD5E1]"
          >
            <button
              type="button"
              onClick={() => scrollToSection('postcard')}
              className="hover:text-[#FFF8F0] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              โปสการ์ดเปิดใจ
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('river')}
              className="hover:text-[#FFF8F0] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              ลานน้ำลอยกระทง
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('customizer')}
              className="hover:text-[#FFF8F0] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              แต่งกระทง
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('gallery')}
              className="hover:text-[#FFF8F0] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              ความทรงจำ
            </button>
          </nav>

          {/* Top Right Actions: Google Login + Primary CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {userEmail ? (
              <button
                type="button"
                disabled={authLoading}
                onClick={() => void handleSignOut()}
                title={`${userEmail} (คลิกเพื่อออกจากระบบ)`}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151E3D] border border-[#6EE7B7]/45 text-[#ECFDF5] hover:bg-white/10 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0"
              >
                <ShieldCheck
                  className={`w-4 h-4 shrink-0 ${
                    effectiveIsAdmin ? 'text-[#6EE7B7]' : 'text-[#CBD5E1]'
                  }`}
                />
                <span className="hidden sm:inline max-w-[130px] truncate">
                  {userEmail}
                </span>
                <span className="sm:hidden">ออก</span>
                <LogOut className="w-3.5 h-3.5 shrink-0 text-[#94A3B8]" />
              </button>
            ) : (
              <button
                type="button"
                disabled={authLoading}
                onClick={() => void handleSignInGoogle()}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF8F0] text-[#0B1024] text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                <LogIn className="w-4 h-4 shrink-0 text-[#C84B78]" />
                <span className="hidden sm:inline">
                  {authLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ Google'}
                </span>
                <span className="sm:hidden">Login</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => scrollToSection('customizer')}
              className="min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl bg-[#F6C56E] hover:bg-[#FDE68A] text-[#0B1024] font-medium text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0"
            >
              ลอยกระทงเลย
            </button>
          </div>
        </div>
      </header>

      {/* Friendly Connection Fallback Banner (only when an actual Firestore error occurs) */}
      {loadError && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-2xl bg-[#1F274D] border border-[#F6C56E]/40 p-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <p className="text-[#FEF3C7]">{loadError}</p>
            <button
              type="button"
              onClick={() => setStorageMode('demo')}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#F6C56E] text-[#0B1024] font-medium whitespace-nowrap"
            >
              สลับเป็นโหมดตัวอย่างทันที
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        <div ref={postcardRef} id="postcard">
          <LovePostcardSection
            toName={draft.toName}
            fromName={draft.fromName}
            userEmail={userEmail}
            isAdmin={effectiveIsAdmin}
            authLoading={authLoading}
            onSignInGoogle={() => void handleSignInGoogle()}
            onSignOut={() => void handleSignOut()}
            onChangeToName={(toName) =>
              setDraft((prev) => ({ ...prev, toName }))
            }
            onChangeFromName={(fromName) =>
              setDraft((prev) => ({ ...prev, fromName }))
            }
            onStartTogether={() => scrollToSection('customizer')}
            onExploreRiver={() => scrollToSection('river')}
          />
        </div>

        <div ref={riverRef} id="river">
          <NightRiverCanvas
            krathongs={krathongs}
            loading={loading}
            newlyLaunchedId={newlyLaunchedId}
            isAudioPlaying={isAudioPlaying}
            storageMode={storageMode}
            boardId={boardId}
            userEmail={userEmail}
            isAdmin={effectiveIsAdmin}
            authLoading={authLoading}
            onSignInGoogle={() => void handleSignInGoogle()}
            onSignOut={() => void handleSignOut()}
            onToggleAudio={handleToggleAudio}
            onSelectKrathong={(k) => setSelectedId(k.id)}
            onOpenCustomizer={() => scrollToSection('customizer')}
            onOpenGuide={() => setIsGuideOpen(true)}
            onSwitchToDemo={() => setStorageMode('demo')}
            onShareRoom={() => void handleShareRoom()}
            onCreateCoupleRoom={() => void handleCreateCoupleRoom()}
            onReturnSharedRoom={handleReturnSharedRoom}
          />
        </div>

        <div ref={customizerRef}>
          <KrathongCustomizer
            draft={draft}
            isSubmitting={isSubmitting}
            errorMessage={submitError}
            onChangeDraft={(updater) => {
              setSubmitError(null);
              setDraft(updater);
            }}
            onSubmit={() => void handleFloatKrathong()}
          />
        </div>

        <div ref={galleryRef}>
          <MemoryGallery
            krathongs={krathongs}
            storageMode={storageMode}
            userEmail={userEmail}
            isAdmin={effectiveIsAdmin}
            authLoading={authLoading}
            authError={authError}
            onSignInGoogle={() => void handleSignInGoogle()}
            onSignOut={() => void handleSignOut()}
            onSelectKrathong={(k) => setSelectedId(k.id)}
            onSendHeart={handleSendHeart}
            onDeleteKrathong={handleDeleteKrathong}
          />
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-6 border-t border-white/10 text-xs text-[#94A3B8] flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>คืนเพ็ญแห่งรัก · ลอยกระทงออนไลน์สำหรับคนพิเศษ</p>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => scrollToSection('gallery')}
            className="text-[#CBD5E1] hover:text-[#FDE68A] underline underline-offset-4 min-h-[36px]"
          >
            ระบบแอดมิน (Google Login)
          </button>
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="text-[#CBD5E1] hover:text-[#FDE68A] underline underline-offset-4 min-h-[36px]"
          >
            ตั้งค่า Firebase Config และ Firestore Rules
          </button>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar (Thumb-zone ergonomic navigation) */}
      <nav
        aria-label="เมนูมือถือ"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-[#0B1024]/95 backdrop-blur-md border-t border-white/10 grid grid-cols-4 items-center"
      >
        <button
          type="button"
          onClick={() => scrollToSection('postcard')}
          className="h-full flex flex-col items-center justify-center gap-0.5 text-[#CBD5E1] hover:text-[#FDE68A]"
        >
          <BookHeart className="w-4 h-4" />
          <span className="text-[10px]">โปสการ์ด</span>
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('river')}
          className="h-full flex flex-col items-center justify-center gap-0.5 text-[#CBD5E1] hover:text-[#FDE68A]"
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px]">ลานน้ำ</span>
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('customizer')}
          className="h-full flex flex-col items-center justify-center gap-0.5 text-[#F6C56E]"
        >
          <PenTool className="w-4 h-4" />
          <span className="text-[10px] font-medium">แต่งกระทง</span>
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('gallery')}
          className="h-full flex flex-col items-center justify-center gap-0.5 text-[#CBD5E1] hover:text-[#FDE68A]"
        >
          <Heart className="w-4 h-4" />
          <span className="text-[10px]">ความทรงจำ</span>
        </button>
      </nav>

      {/* Modals */}
      <KrathongDetailModal
        krathong={selectedKrathong}
        isAdmin={effectiveIsAdmin}
        onClose={() => setSelectedId(null)}
        onSendHeart={handleSendHeart}
        onDeleteKrathong={handleDeleteKrathong}
      />

      <FirebaseGuideModal
        isOpen={isGuideOpen}
        storageMode={storageMode}
        onChangeMode={(mode) => {
          setStorageMode(mode);
          setIsGuideOpen(false);
          showToast(
            mode === 'firebase'
              ? 'เชื่อมต่อโหมด Firebase Firestore Real-time แล้ว'
              : 'สลับเป็นโหมดตัวอย่าง (Demo / Local) แล้ว'
          );
        }}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Gentle Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-16 md:bottom-6 right-4 left-4 sm:left-auto sm:max-w-sm z-50 rounded-2xl bg-[#19234A] border border-[#F6C56E]/50 px-4 py-3 shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm text-[#FFF8F0]"
        >
          <Sparkles className="w-4 h-4 text-[#FDE68A] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
