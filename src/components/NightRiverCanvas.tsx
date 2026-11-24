import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Heart,
  Volume2,
  VolumeX,
  Plus,
  Sparkles,
  Database,
  Share2,
  Users,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { DEFAULT_BOARD_ID, type KrathongRecord } from '@/src/types/krathong';
import type { StorageMode } from '@/src/services/krathongService';
import { KrathongArtwork } from './KrathongArtwork';

interface NightRiverCanvasProps {
  krathongs: KrathongRecord[];
  loading: boolean;
  newlyLaunchedId: string | null;
  isAudioPlaying: boolean;
  storageMode: StorageMode;
  boardId: string;
  userEmail: string | null;
  isAdmin: boolean;
  authLoading: boolean;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  onToggleAudio: () => void;
  onSelectKrathong: (krathong: KrathongRecord) => void;
  onOpenCustomizer: () => void;
  onOpenGuide: () => void;
  onSwitchToDemo: () => void;
  onShareRoom: () => void;
  onCreateCoupleRoom: () => void;
  onReturnSharedRoom: () => void;
}

interface FloatingPosition {
  lane: number;
  basePercent: number;
  speed: number;
  scale: number;
}

const STARS = [
  { x: '8%', y: '14%', size: 2, delay: '0s' },
  { x: '18%', y: '28%', size: 1.5, delay: '1.1s' },
  { x: '29%', y: '10%', size: 2.5, delay: '2.2s' },
  { x: '42%', y: '22%', size: 1.5, delay: '0.7s' },
  { x: '54%', y: '12%', size: 2, delay: '1.8s' },
  { x: '67%', y: '26%', size: 1.5, delay: '2.6s' },
  { x: '76%', y: '15%', size: 2, delay: '0.4s' },
  { x: '91%', y: '34%', size: 1.5, delay: '1.5s' },
];

const SKY_LANTERNS = [
  { left: '14%', bottom: '36%', scale: 0.75, delay: '0s' },
  { left: '34%', bottom: '42%', scale: 0.62, delay: '4.5s' },
  { left: '62%', bottom: '38%', scale: 0.8, delay: '8.2s' },
  { left: '78%', bottom: '44%', scale: 0.58, delay: '12.5s' },
];

export const NightRiverCanvas: React.FC<NightRiverCanvasProps> = ({
  krathongs,
  loading,
  newlyLaunchedId,
  isAudioPlaying,
  storageMode,
  boardId,
  userEmail,
  isAdmin,
  authLoading,
  onSignInGoogle,
  onSignOut,
  onToggleAudio,
  onSelectKrathong,
  onOpenCustomizer,
  onOpenGuide,
  onSwitchToDemo,
  onShareRoom,
  onCreateCoupleRoom,
  onReturnSharedRoom,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [tickOffset, setTickOffset] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const launchOriginRef = useRef<{ id: string; startTick: number } | null>(null);

  useEffect(() => {
    if (newlyLaunchedId) {
      launchOriginRef.current = { id: newlyLaunchedId, startTick: tickOffset };
    }
  }, [newlyLaunchedId]);

  // Smooth gentle horizontal drift along the river using requestAnimationFrame
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;
      if (!isPaused) {
        setTickOffset((prev) => (prev + dt * 5.2) % 10000);
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused]);

  const visibleKrathongs = useMemo(() => krathongs.slice(0, 18), [krathongs]);

  const layoutMap = useMemo(() => {
    const map = new Map<string, FloatingPosition>();
    visibleKrathongs.forEach((k, idx) => {
      const lane = idx % 3; // 0 = far, 1 = mid, 2 = near
      const spacing = 100 / Math.max(Math.min(visibleKrathongs.length, 6), 3);
      const basePercent = ((idx * spacing * 1.15) + lane * 14) % 92;
      const speed = lane === 0 ? 0.8 : lane === 1 ? 1.05 : 1.35;
      const scale = lane === 0 ? 0.78 : lane === 1 ? 0.92 : 1.04;
      map.set(k.id, { lane, basePercent, speed, scale });
    });
    return map;
  }, [visibleKrathongs]);

  const isPrivateCoupleRoom = boardId !== DEFAULT_BOARD_ID;

  return (
    <section
      aria-label="สนามน้ำลอยกระทงแบบ Interactive"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
    >
      {/* Clean Workspace Toolbar above River Canvas */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="space-y-0.5">
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#FFF8F0]">
            สายน้ำแห่งคำอธิษฐานคืนวันเพ็ญ
          </h2>
          <p className="text-xs sm:text-sm text-[#A5B4FC]">
            {isPrivateCoupleRoom ? `ห้องคู่รัก: ${boardId}` : 'สายน้ำส่วนกลาง (เห็นร่วมกันทุกคน)'} ·{' '}
            <span className="tabular-nums text-[#FDE68A]">
              กำลังลอยอยู่ {krathongs.length} ลำ
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userEmail ? (
            <button
              type="button"
              disabled={authLoading}
              onClick={onSignOut}
              title={`เข้าสู่ระบบด้วย ${userEmail} (คลิกเพื่อออกจากระบบ)`}
              className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#151E3D] border border-[#6EE7B7]/40 text-[#ECFDF5] hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
            >
              <ShieldCheck
                className={`w-4 h-4 shrink-0 ${
                  isAdmin ? 'text-[#6EE7B7]' : 'text-[#CBD5E1]'
                }`}
              />
              <span className="max-w-[140px] truncate">{userEmail}</span>
              <LogOut className="w-3.5 h-3.5 shrink-0 text-[#94A3B8]" />
            </button>
          ) : (
            <button
              type="button"
              disabled={authLoading}
              onClick={onSignInGoogle}
              className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white text-[#0B1024] hover:bg-[#FFF8F0] transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span>{authLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ Google (แอดมิน)'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onShareRoom}
            className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#D85A84]/20 border border-[#D85A84]/50 text-[#FDE2EC] hover:bg-[#D85A84]/35 transition-colors whitespace-nowrap shrink-0"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>แชร์ลิงก์ให้แฟน</span>
          </button>

          {isPrivateCoupleRoom ? (
            <button
              type="button"
              onClick={onReturnSharedRoom}
              className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#151E3D] border border-white/15 text-[#CBD5E1] hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <Users className="w-4 h-4 shrink-0 text-[#A5B4FC]" />
              <span>กลับสายน้ำรวม</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCreateCoupleRoom}
              className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#151E3D] border border-white/15 text-[#CBD5E1] hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <Users className="w-4 h-4 shrink-0 text-[#F497B6]" />
              <span>สร้างห้องเฉพาะเราสองคน</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleAudio}
            aria-pressed={isAudioPlaying}
            className={`min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap shrink-0 ${
              isAudioPlaying
                ? 'bg-[#F6C56E]/20 border-[#F6C56E]/60 text-[#FDE68A]'
                : 'bg-[#151E3D] border-white/15 text-[#CBD5E1] hover:text-white hover:border-white/30'
            }`}
          >
            {isAudioPlaying ? (
              <Volume2 className="w-4 h-4 shrink-0" />
            ) : (
              <VolumeX className="w-4 h-4 shrink-0" />
            )}
            <span>{isAudioPlaying ? 'เสียง: เปิด' : 'เปิดเสียง'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#151E3D] border border-white/15 text-[#CBD5E1] hover:text-white hover:border-white/30 transition-colors whitespace-nowrap shrink-0"
          >
            <Database className="w-4 h-4 shrink-0 text-[#A5B4FC]" />
            <span>
              {storageMode === 'firebase' ? 'Firestore' : 'Demo'}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenCustomizer}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#F6C56E] hover:bg-[#FDE68A] text-[#0B1024] shadow-lg shadow-[#F6C56E]/20 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>แต่งกระทงลอย</span>
          </button>
        </div>
      </div>

      {/* Interactive Night Sky & Floating River Viewport */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full h-[460px] sm:h-[520px] lg:h-[560px] rounded-3xl overflow-hidden border border-[#A5B4FC]/20 shadow-2xl shadow-[#040714]/70 bg-gradient-to-b from-[#090D20] via-[#131B3E] to-[#0B1433]"
      >
        {/* Night Sky Stars */}
        {STARS.map((star, idx) => (
          <span
            key={idx}
            aria-hidden="true"
            className="animate-twinkle absolute rounded-full bg-[#FFF8F0]"
            style={{
              left: star.x,
              top: star.y,
              width: `${star.size * 2}px`,
              height: `${star.size * 2}px`,
              animationDelay: star.delay,
            }}
          />
        ))}

        {/* Floating Sky Lanterns (Khom Loy) */}
        {SKY_LANTERNS.map((lantern, idx) => (
          <div
            key={idx}
            aria-hidden="true"
            className="animate-lantern pointer-events-none absolute z-10"
            style={{
              left: lantern.left,
              bottom: lantern.bottom,
              animationDelay: lantern.delay,
              transform: `scale(${lantern.scale})`,
            }}
          >
            <div className="w-5 h-7 rounded-t-lg rounded-b-sm bg-gradient-to-b from-[#FDE68A] via-[#FDBA74] to-[#FB923C] shadow-[0_0_16px_rgba(251,146,60,0.65)] opacity-85" />
          </div>
        ))}

        {/* Full Moon & Halo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-6 right-8 sm:top-8 sm:right-14 z-10"
        >
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] shadow-[0_0_80px_20px_rgba(253,230,138,0.32)]">
            <div className="absolute top-3 left-4 w-4 h-4 rounded-full bg-[#F59E0B]/15" />
            <div className="absolute bottom-5 right-5 w-6 h-5 rounded-full bg-[#F59E0B]/10" />
          </div>
        </div>

        {/* Distant Horizon Silhouette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[35%] h-10 bg-gradient-to-t from-[#0D1638] to-transparent z-10"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 1200 70"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-[31%] w-full h-12 sm:h-16 z-10 opacity-70"
        >
          <path
            d="M0,70 L0,45 Q120,25 240,42 T480,38 T720,44 T960,34 T1200,45 L1200,70 Z"
            fill="#0A112A"
          />
        </svg>

        {/* River Surface */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[38%] bg-gradient-to-b from-[#111D45] via-[#0D183B] to-[#080F26]"
        >
          {/* Shimmering Moonlight Column on the Water */}
          <div className="absolute right-10 sm:right-20 top-2 w-24 sm:w-32 h-full flex flex-col items-center gap-3.5 opacity-60">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((line) => (
              <div
                key={line}
                className="animate-water-shimmer h-1.5 rounded-full bg-gradient-to-r from-transparent via-[#FEF3C7]/65 to-transparent"
                style={{
                  width: `${90 - line * 6}%`,
                  animationDelay: `${line * 0.45}s`,
                }}
              />
            ))}
          </div>

          {/* Subtle horizontal water waves */}
          <div className="absolute inset-x-0 top-10 h-px bg-gradient-to-r from-transparent via-[#A5B4FC]/15 to-transparent" />
          <div className="absolute inset-x-0 top-28 h-px bg-gradient-to-r from-transparent via-[#F6C56E]/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-16 h-px bg-gradient-to-r from-transparent via-[#A5B4FC]/15 to-transparent" />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#090D20]/60 backdrop-blur-xs">
            <div className="text-center space-y-2 px-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#FDE68A] border-t-transparent animate-spin mx-auto" />
              <p className="text-sm text-[#FFF8F0]">กำลังเตรียมผิวน้ำใต้แสงจันทร์...</p>
            </div>
          </div>
        )}

        {/* Empty State (if no krathongs yet) */}
        {!loading && visibleKrathongs.length === 0 && (
          <div className="absolute inset-x-0 bottom-8 top-[42%] z-20 flex items-center justify-center p-4">
            <div className="max-w-md w-full rounded-2xl bg-[#141D3D]/90 backdrop-blur-md border border-[#F6C56E]/30 p-6 text-center space-y-4">
              <p className="font-display text-lg font-medium text-[#FFF8F0]">
                ผิวน้ำคืนนี้ยังรอคุณสองคนอยู่
              </p>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">
                มาแต่งกระทงใบแรก เขียนคำอธิษฐาน และส่งความในใจถึงคนพิเศษกันเลย
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onOpenCustomizer}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#F6C56E] hover:bg-[#FDE68A] text-[#0B1024] font-medium text-sm transition-colors"
                >
                  แต่งกระทงใบแรก
                </button>
                <button
                  type="button"
                  onClick={onSwitchToDemo}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-white/20 text-[#E2E8F0] hover:bg-white/10 text-sm transition-colors"
                >
                  ลองดูตัวอย่างบนผิวน้ำ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Interactive Krathongs */}
        <div className="absolute inset-x-0 bottom-0 top-[38%] z-20">
          {visibleKrathongs.map((krathong) => {
            const pos = layoutMap.get(krathong.id);
            if (!pos) return null;

            const isNew = krathong.id === newlyLaunchedId;
            const xPercent =
              isNew && launchOriginRef.current?.id === krathong.id
                ? ((18 +
                    Math.max(0, tickOffset - launchOriginRef.current.startTick) *
                      pos.speed) %
                    108) -
                  8
                : ((pos.basePercent + tickOffset * pos.speed) % 108) - 8;

            const topPercent =
              pos.lane === 0 ? 12 : pos.lane === 1 ? 37 : 63;

            return (
              <button
                key={krathong.id}
                type="button"
                onClick={() => onSelectKrathong(krathong)}
                aria-label={`เปิดอ่านกระทงถึง ${krathong.toName} จาก ${krathong.fromName}`}
                className="group absolute -translate-x-1/2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE68A] rounded-2xl p-1 cursor-pointer transition-transform duration-200 hover:scale-110 hover:z-40 min-w-[44px] min-h-[44px]"
                style={{
                  left: `${xPercent}%`,
                  top: `${topPercent}%`,
                  zIndex: isNew ? 35 : 20 + pos.lane,
                  transform: `translate3d(-50%, 0, 0) scale(${isNew ? 1.12 : pos.scale})`,
                }}
              >
                {/* Launch Celebration Spotlight Ring */}
                {isNew && (
                  <span
                    aria-hidden="true"
                    className="animate-ripple pointer-events-none absolute inset-0 rounded-full border-2 border-[#FDE68A]/80"
                  />
                )}

                <div className="animate-krathong-bob flex flex-col items-center">
                  <KrathongArtwork
                    style={krathong.krathongStyle}
                    flowerColor={krathong.flowerColor}
                    candleColor={krathong.candleColor}
                    size="sm"
                    showRipples
                  />

                  {/* Clean Readable Tag Below Krathong */}
                  <div className="mt-0.5 px-2.5 py-1 rounded-lg bg-[#090E23]/85 backdrop-blur-xs border border-white/15 group-hover:border-[#FDE68A]/60 transition-colors flex items-center gap-1.5 text-[11px] sm:text-xs text-[#FFF8F0] whitespace-nowrap shadow-md">
                    {isNew && (
                      <Sparkles className="w-3 h-3 text-[#FDE68A] shrink-0" />
                    )}
                    <span className="max-w-[96px] truncate font-medium">
                      ถึง {krathong.toName}
                    </span>
                    <span aria-hidden="true" className="text-white/40">
                      ·
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[#F7A8C4] tabular-nums">
                      <Heart className="w-3 h-3 fill-[#F7A8C4]" />
                      {krathong.heartsCount}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Subtle interaction hint bottom-left */}
        <div className="pointer-events-none absolute bottom-3 left-4 z-30 hidden sm:flex items-center gap-2 text-xs text-[#CBD5E1]/80 bg-[#090D20]/65 px-3 py-1.5 rounded-lg backdrop-blur-xs border border-white/10">
          <span>
            {isPaused
              ? 'หยุดสายน้ำชั่วคราวเพื่อให้เลือกแตะกระทงได้ง่ายขึ้น'
              : 'เลื่อนเมาส์มาบนผิวน้ำเพื่อหยุดชั่วคราว และแตะกระทงเพื่ออ่านคำอธิษฐาน'}
          </span>
        </div>
      </div>
    </section>
  );
};
