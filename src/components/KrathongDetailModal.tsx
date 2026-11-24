import React, { useEffect, useState } from 'react';
import { Heart, X, ImageOff, Trash2 } from 'lucide-react';
import {
  KRATHONG_STYLE_OPTIONS,
  type KrathongRecord,
} from '@/src/types/krathong';
import { KrathongArtwork } from './KrathongArtwork';

interface KrathongDetailModalProps {
  krathong: KrathongRecord | null;
  isAdmin: boolean;
  onClose: () => void;
  onSendHeart: (id: string) => Promise<void>;
  onDeleteKrathong: (id: string) => Promise<void>;
}

export const KrathongDetailModal: React.FC<KrathongDetailModalProps> = ({
  krathong,
  isAdmin,
  onClose,
  onSendHeart,
  onDeleteKrathong,
}) => {
  const [sendingHeart, setSendingHeart] = useState(false);
  const [burstKeys, setBurstKeys] = useState<number[]>([]);
  const [imgFailed, setImgFailed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setImgFailed(false);
    setBurstKeys([]);
    setConfirmDelete(false);
    setIsDeleting(false);
  }, [krathong?.id]);

  useEffect(() => {
    if (!krathong) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [krathong, onClose]);

  if (!krathong) return null;

  const styleLabel =
    KRATHONG_STYLE_OPTIONS.find((s) => s.id === krathong.krathongStyle)?.label ??
    'กระทงคืนเพ็ญ';

  const formattedDate = new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(krathong.createdAt));

  const handleHeartClick = async () => {
    if (sendingHeart) return;
    setSendingHeart(true);
    setBurstKeys((prev) => [...prev.slice(-4), Date.now()]);
    try {
      await onSendHeart(krathong.id);
    } finally {
      setSendingHeart(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDeleteKrathong(krathong.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#040714]/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="krathong-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#131C3B] border border-[#F6C56E]/25 shadow-2xl text-[#FFF8F0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Sheet Handle */}
        <div className="sm:hidden pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-white/25 mx-auto" />
        </div>

        {/* Header Showcase */}
        <div className="relative px-6 pt-5 pb-4 bg-gradient-to-b from-[#1B2752] to-[#131C3B] flex flex-col items-center text-center border-b border-white/10">
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="absolute top-4 right-4 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-[#FFF8F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="animate-krathong-bob">
            <KrathongArtwork
              style={krathong.krathongStyle}
              flowerColor={krathong.flowerColor}
              candleColor={krathong.candleColor}
              size="md"
              showRipples
            />
          </div>

          <h3
            id="krathong-modal-title"
            className="font-display text-xl font-semibold text-[#FFF8F0] mt-2"
          >
            ถึง {krathong.toName}
          </h3>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-xs text-[#CBD5E1]">
            <span>จาก {krathong.fromName}</span>
            <span aria-hidden="true">·</span>
            <span>{styleLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Wish Card */}
          <div className="rounded-2xl bg-[#FFF8F0] text-[#2B2233] p-5 space-y-2 border border-[#F6C56E]/35">
            <p className="text-xs font-medium text-[#C84B78]">คำอธิษฐานลอยกระทง</p>
            <p className="text-sm sm:text-base leading-relaxed text-[#2B2233]">
              “{krathong.wishText}”
            </p>
          </div>

          {/* Romantic Love Note */}
          {krathong.loveNote && (
            <div className="rounded-2xl bg-[#1A2449] border border-[#F497B6]/25 p-5 space-y-1.5">
              <p className="text-xs font-medium text-[#F7A8C4]">
                ข้อความความในใจถึง {krathong.toName}
              </p>
              <p className="text-sm leading-relaxed text-[#F8F3EC]">
                {krathong.loveNote}
              </p>
            </div>
          )}

          {/* Optional Couple Memory Photo */}
          {krathong.imageData && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#CBD5E1]">ภาพความทรงจำ</p>
              {imgFailed ? (
                <div className="h-44 rounded-2xl bg-[#0D142E] border border-white/10 flex flex-col items-center justify-center gap-2 text-xs text-[#94A3B8]">
                  <ImageOff className="w-6 h-6 text-[#94A3B8]" />
                  <span>ไม่สามารถโหลดภาพความทรงจำนี้ได้</span>
                </div>
              ) : (
                <img
                  src={krathong.imageData}
                  alt={`ภาพความทรงจำของ ${krathong.fromName} และ ${krathong.toName}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full max-h-72 object-cover rounded-2xl border border-white/15"
                />
              )}
            </div>
          )}

          {/* Send Heart Action */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
            <div className="text-xs sm:text-sm text-[#CBD5E1]">
              กำลังใจที่ส่งให้กระทงใบนี้:{' '}
              <span className="font-semibold text-[#F7A8C4] tabular-nums">
                {krathong.heartsCount} ดวง
              </span>
            </div>

            <div className="relative">
              {burstKeys.map((key) => (
                <span
                  key={key}
                  aria-hidden="true"
                  className="animate-heart-burst pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-[#F472B6]"
                >
                  <Heart className="w-5 h-5 fill-[#F472B6]" />
                </span>
              ))}

              <button
                type="button"
                disabled={sendingHeart}
                onClick={handleHeartClick}
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D85A84] hover:bg-[#C44972] text-white font-medium text-sm shadow-lg shadow-[#D85A84]/25 transition-all active:scale-95 disabled:opacity-70 whitespace-nowrap"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>ส่งหัวใจให้กระทงนี้</span>
              </button>
            </div>
          </div>

          {/* Admin Delete Control */}
          {isAdmin && (
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#94A3B8]">
                สิทธิ์ผู้ดูแลระบบ
              </span>
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7F1D1D]/40 hover:bg-[#7F1D1D]/70 border border-[#FCA5A5]/35 text-xs font-medium text-[#FECACA] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบกระทงนี้</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => void handleConfirmDelete()}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-medium transition-colors disabled:opacity-60"
                  >
                    {isDeleting ? 'กำลังลบ...' : 'ยืนยันลบถาวร'}
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setConfirmDelete(false)}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#E2E8F0] text-xs font-medium transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
