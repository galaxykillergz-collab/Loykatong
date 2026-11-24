import React, { useMemo, useState } from 'react';
import {
  Heart,
  Search,
  Image as ImageIcon,
  ShieldCheck,
  LogIn,
  LogOut,
  Trash2,
} from 'lucide-react';
import {
  KRATHONG_STYLE_OPTIONS,
  type KrathongRecord,
  type KrathongStyle,
} from '@/src/types/krathong';
import type { StorageMode } from '@/src/services/krathongService';
import { KrathongArtwork } from './KrathongArtwork';

interface MemoryGalleryProps {
  krathongs: KrathongRecord[];
  storageMode: StorageMode;
  userEmail: string | null;
  isAdmin: boolean;
  authLoading: boolean;
  authError: string | null;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  onSelectKrathong: (krathong: KrathongRecord) => void;
  onSendHeart: (id: string) => Promise<void>;
  onDeleteKrathong: (id: string) => Promise<void>;
}

export const MemoryGallery: React.FC<MemoryGalleryProps> = ({
  krathongs,
  storageMode,
  userEmail,
  isAdmin,
  authLoading,
  authError,
  onSignInGoogle,
  onSignOut,
  onSelectKrathong,
  onSendHeart,
  onDeleteKrathong,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState<'all' | KrathongStyle>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'hearts'>('newest');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredKrathongs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return krathongs
      .filter((item) => {
        if (styleFilter !== 'all' && item.krathongStyle !== styleFilter) {
          return false;
        }
        if (!q) return true;
        return (
          item.toName.toLowerCase().includes(q) ||
          item.fromName.toLowerCase().includes(q) ||
          item.wishText.toLowerCase().includes(q) ||
          item.loveNote.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'hearts') {
          return b.heartsCount - a.heartsCount || b.createdAt - a.createdAt;
        }
        return b.createdAt - a.createdAt;
      });
  }, [krathongs, searchQuery, styleFilter, sortBy]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteKrathong(id);
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section
      id="memory-gallery"
      aria-label="แกลเลอรีความทรงจำคืนวันเพ็ญ"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
    >
      {/* Header & Sort */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
        <div className="space-y-1">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#FFF8F0]">
            แกลเลอรีความทรงจำ &amp; คำอธิษฐาน
          </h2>
          <p className="text-sm text-[#CBD5E1]">
            เปิดอ่านเรื่องราวและคำอวยพรจากกระทงทั้งหมดที่ลอยไปแล้ว{' '}
            <span className="tabular-nums text-[#FDE68A]">
              ({filteredKrathongs.length} รายการ)
            </span>
          </p>
        </div>

        {/* Sort segmented buttons */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[#141D3D] border border-white/10 self-start">
          <button
            type="button"
            onClick={() => setSortBy('newest')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              sortBy === 'newest'
                ? 'bg-[#F6C56E] text-[#0B1024]'
                : 'text-[#CBD5E1] hover:text-white'
            }`}
          >
            ลอยล่าสุด
          </button>
          <button
            type="button"
            onClick={() => setSortBy('hearts')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              sortBy === 'hearts'
                ? 'bg-[#F6C56E] text-[#0B1024]'
                : 'text-[#CBD5E1] hover:text-white'
            }`}
          >
            หัวใจมากสุด
          </button>
        </div>
      </div>

      {/* Admin Google Login & Moderation Bar */}
      <div className="mb-6 rounded-2xl bg-[#111936] border border-white/10 px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
          <ShieldCheck
            className={`w-4 h-4 shrink-0 ${
              isAdmin ? 'text-[#6EE7B7]' : 'text-[#A5B4FC]'
            }`}
          />
          {storageMode === 'demo' ? (
            <span className="text-[#CBD5E1]">
              โหมดตัวอย่าง (Local): สามารถทดสอบลบกระทงได้ทันที หรือสลับเป็น Firestore เพื่อล็อกอิน Google
            </span>
          ) : userEmail ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#FFF8F0] font-medium">{userEmail}</span>
              <span aria-hidden="true" className="text-white/30">
                ·
              </span>
              {isAdmin ? (
                <span className="text-[#6EE7B7]">
                  สิทธิ์แอดมินพร้อมใช้งาน (สามารถลบกระทงได้)
                </span>
              ) : (
                <span className="text-[#FCA5A5]">
                  บัญชีนี้ไม่มีสิทธิ์แอดมินสำหรับลบกระทง
                </span>
              )}
            </div>
          ) : (
            <span className="text-[#CBD5E1]">
              สำหรับผู้ดูแลระบบ: เข้าสู่ระบบด้วย Google เพื่อจัดการและลบกระทง
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {storageMode === 'firebase' &&
            (userEmail ? (
              <button
                type="button"
                disabled={authLoading}
                onClick={onSignOut}
                className="min-h-[40px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-medium text-[#FFF8F0] transition-colors whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={authLoading}
                onClick={onSignInGoogle}
                className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#0B1024] hover:bg-[#FFF8F0] text-xs sm:text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-60"
              >
                <LogIn className="w-4 h-4" />
                <span>
                  {authLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบแอดมิน (Google)'}
                </span>
              </button>
            ))}
        </div>
      </div>

      {authError && (
        <div
          role="alert"
          className="mb-5 rounded-xl bg-[#7F1D1D]/40 border border-[#FCA5A5]/40 px-4 py-3 text-xs sm:text-sm text-[#FECACA]"
        >
          {authError}
        </div>
      )}

      {/* Search & Style Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-3 mb-7">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อแฟน ชื่อผู้ส่ง หรือคำอธิษฐาน..."
            className="w-full min-h-[44px] rounded-xl bg-[#141D3D] border border-white/15 pl-10 pr-4 py-2.5 text-sm text-[#FFF8F0] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#F6C56E]/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setStyleFilter('all')}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
              styleFilter === 'all'
                ? 'bg-white/15 border-[#F6C56E] text-white'
                : 'bg-[#141D3D] border-white/10 text-[#CBD5E1] hover:text-white'
            }`}
          >
            ทั้งหมด
          </button>
          {KRATHONG_STYLE_OPTIONS.map((styleOpt) => (
            <button
              key={styleOpt.id}
              type="button"
              onClick={() => setStyleFilter(styleOpt.id)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                styleFilter === styleOpt.id
                  ? 'bg-white/15 border-[#F6C56E] text-white'
                  : 'bg-[#141D3D] border-white/10 text-[#CBD5E1] hover:text-white'
              }`}
            >
              {styleOpt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty Search Result */}
      {filteredKrathongs.length === 0 ? (
        <div className="rounded-3xl bg-[#141D3D] border border-white/10 p-10 text-center space-y-2">
          <p className="font-display text-base font-medium text-[#FFF8F0]">
            ไม่พบกระทงที่ตรงกับคำค้นหา
          </p>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            ลองเปลี่ยนคำค้นหา หรือเลือกดูแบบกระทงทั้งหมด
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredKrathongs.map((item) => {
            const styleName =
              KRATHONG_STYLE_OPTIONS.find((s) => s.id === item.krathongStyle)
                ?.label ?? 'กระทงคืนเพ็ญ';
            const dateLabel = new Intl.DateTimeFormat('th-TH', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(item.createdAt));

            const isConfirming = confirmDeleteId === item.id;
            const isDeletingThis = deletingId === item.id;

            return (
              <article
                key={item.id}
                className="group rounded-2xl bg-[#141D3D] border border-white/10 hover:border-[#F6C56E]/45 transition-colors p-5 flex flex-col justify-between gap-4"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectKrathong(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectKrathong(item);
                    }
                  }}
                  className="cursor-pointer space-y-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F6C56E] rounded-xl"
                >
                  {/* Top Row: Krathong Miniature + Names */}
                  <div className="flex items-center gap-3.5">
                    <div className="rounded-2xl bg-[#0C132D] border border-white/10 p-1.5 shrink-0">
                      <KrathongArtwork
                        style={item.krathongStyle}
                        flowerColor={item.flowerColor}
                        candleColor={item.candleColor}
                        size="sm"
                        showRipples={false}
                        className="!w-16 !h-16"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="font-display text-base font-semibold text-[#FFF8F0] truncate">
                        ถึง {item.toName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#94A3B8]">
                        <span className="truncate max-w-[120px]">
                          จาก {item.fromName}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{styleName}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] tabular-nums">
                        {dateLabel}
                      </p>
                    </div>
                  </div>

                  {/* Wish Excerpt */}
                  <p className="text-sm text-[#E2E8F0] leading-relaxed line-clamp-3">
                    “{item.wishText}”
                  </p>

                  {item.loveNote && (
                    <p className="text-xs text-[#F7A8C4] leading-relaxed line-clamp-2">
                      {item.loveNote}
                    </p>
                  )}

                  {item.imageData && (
                    <div className="flex items-center gap-2 text-xs text-[#A5B4FC]">
                      <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>มีรูปภาพความทรงจำแนบอยู่ — แตะเพื่อเปิดชม</span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectKrathong(item)}
                    className="min-h-[40px] text-xs font-medium text-[#FDE68A] hover:underline"
                  >
                    อ่านการ์ดเต็ม
                  </button>

                  <div className="flex items-center gap-2">
                    {isAdmin &&
                      (!isConfirming ? (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id)}
                          aria-label={`ลบกระทงถึง ${item.toName}`}
                          className="min-h-[40px] inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#7F1D1D]/35 hover:bg-[#7F1D1D]/65 border border-[#FCA5A5]/30 text-xs text-[#FECACA] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ลบ</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isDeletingThis}
                            onClick={() => void handleDelete(item.id)}
                            className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-medium disabled:opacity-60"
                          >
                            {isDeletingThis ? 'กำลังลบ...' : 'ยืนยัน'}
                          </button>
                          <button
                            type="button"
                            disabled={isDeletingThis}
                            onClick={() => setConfirmDeleteId(null)}
                            className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-white/10 text-[#CBD5E1] text-xs"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ))}

                    <button
                      type="button"
                      onClick={() => void onSendHeart(item.id)}
                      aria-label={`ส่งหัวใจให้กระทงถึง ${item.toName}`}
                      className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D85A84]/15 hover:bg-[#D85A84]/30 border border-[#D85A84]/35 text-xs font-medium text-[#FDE2EC] transition-colors tabular-nums"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#F472B6] fill-[#F472B6]" />
                      <span>{item.heartsCount}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
