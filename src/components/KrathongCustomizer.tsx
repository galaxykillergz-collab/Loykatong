import React, { useRef, useState } from 'react';
import { ImagePlus, Link as LinkIcon, Send, Trash2, Sparkles } from 'lucide-react';
import {
  CANDLE_COLOR_OPTIONS,
  FLOWER_COLOR_OPTIONS,
  KRATHONG_LIMITS,
  KRATHONG_STYLE_OPTIONS,
  LOVE_NOTE_PRESETS,
  WISH_PRESETS,
  type KrathongDraft,
} from '@/src/types/krathong';
import { compressImageFileToDataUrl, isValidImageInput } from '@/src/utils/imageHelper';
import { KrathongArtwork } from './KrathongArtwork';

interface KrathongCustomizerProps {
  draft: KrathongDraft;
  isSubmitting: boolean;
  errorMessage: string | null;
  onChangeDraft: (updater: (prev: KrathongDraft) => KrathongDraft) => void;
  onSubmit: () => void;
}

export const KrathongCustomizer: React.FC<KrathongCustomizerProps> = ({
  draft,
  isSubmitting,
  errorMessage,
  onChangeDraft,
  onSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imageError, setImageError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const selectedStyleMeta =
    KRATHONG_STYLE_OPTIONS.find((s) => s.id === draft.krathongStyle) ??
    KRATHONG_STYLE_OPTIONS[0];
  const selectedFlowerMeta =
    FLOWER_COLOR_OPTIONS.find((f) => f.id === draft.flowerColor) ??
    FLOWER_COLOR_OPTIONS[0];
  const selectedCandleMeta =
    CANDLE_COLOR_OPTIONS.find((c) => c.id === draft.candleColor) ??
    CANDLE_COLOR_OPTIONS[0];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    setIsCompressing(true);
    try {
      const compressed = await compressImageFileToDataUrl(file);
      onChangeDraft((prev) => ({ ...prev, imageData: compressed }));
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : 'ไม่สามารถอัปโหลดรูปภาพได้'
      );
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (url: string) => {
    setImageError(null);
    if (url.trim() && !url.trim().startsWith('https://')) {
      setImageError('ลิงก์รูปภาพต้องขึ้นต้นด้วย https:// เพื่อความปลอดภัย');
    } else if (!isValidImageInput(url)) {
      setImageError('รูปแบบลิงก์รูปภาพไม่ถูกต้อง');
    }
    onChangeDraft((prev) => ({ ...prev, imageData: url }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <section
      id="krathong-customizer"
      aria-label="แต่งกระทงและเขียนคำอธิษฐาน"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
    >
      <div className="mb-6 sm:mb-8 space-y-1.5">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#FFF8F0]">
          แต่งกระทงแทนใจ &amp; เขียนคำอธิษฐาน
        </h2>
        <p className="text-sm text-[#CBD5E1]">
          เลือกรูปแบบกระทง ดอกไม้ แสงเทียน พร้อมฝากข้อความถึงคนพิเศษก่อนปล่อยลงสายน้ำ
        </p>
      </div>

      <form
        noValidate
        onSubmit={handleFormSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch"
      >
        {/* Left: Live Interactive Preview Stage */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-[#162044] via-[#101836] to-[#0A1129] border border-white/10 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-1">
            <p className="text-xs text-[#A5B4FC]">ตัวอย่างกระทงของคุณ</p>
            <h3 className="font-display text-lg font-medium text-[#FFF8F0]">
              {selectedStyleMeta.label}
            </h3>
            <p className="text-xs text-[#CBD5E1]">
              {selectedFlowerMeta.label} · {selectedCandleMeta.label}
            </p>
          </div>

          <div className="relative my-8 flex flex-col items-center justify-center py-8 rounded-2xl bg-[#090E24]/60 border border-white/5 overflow-hidden">
            {/* Subtle moon reflection */}
            <div
              aria-hidden="true"
              className="absolute inset-x-10 bottom-5 h-10 rounded-full bg-[#1D2D5E]/40 blur-md"
            />
            <div className="animate-krathong-bob relative z-10">
              <KrathongArtwork
                style={draft.krathongStyle}
                flowerColor={draft.flowerColor}
                candleColor={draft.candleColor}
                size="lg"
                showRipples
              />
            </div>
            <div className="mt-3 text-center text-xs text-[#FDE68A] relative z-10">
              ถึง {draft.toName.trim() || '...'} · จาก {draft.fromName.trim() || '...'}
            </div>
          </div>

          {/* Live Romantic Card Snippet */}
          <div className="rounded-2xl bg-[#FFF8F0] text-[#2B2233] p-5 space-y-2 border border-[#F6C56E]/30">
            <p className="text-xs font-medium text-[#C84B78]">
              คำอธิษฐานคืนเพ็ญ
            </p>
            <p className="text-sm text-[#3E303B] leading-relaxed min-h-[2.75rem]">
              {draft.wishText.trim() || 'เขียนคำอธิษฐานที่อยากขอร่วมกันในคืนนี้...'}
            </p>
            {draft.loveNote.trim() && (
              <p className="pt-2 border-t border-[#EADBC8] text-xs text-[#6B5460] leading-relaxed">
                “{draft.loveNote.trim()}”
              </p>
            )}
          </div>
        </div>

        {/* Right: Customizer Controls & Message Composer */}
        <div className="lg:col-span-7 rounded-3xl bg-[#141D3D] border border-white/10 p-6 sm:p-8 space-y-7">
          {/* 1. Krathong Style */}
          <div className="space-y-3">
            <label className="block font-display text-sm font-medium text-[#FFF8F0]">
              1. เลือกแบบกระทง
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {KRATHONG_STYLE_OPTIONS.map((item) => {
                const active = draft.krathongStyle === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      onChangeDraft((prev) => ({ ...prev, krathongStyle: item.id }))
                    }
                    className={`min-h-[56px] text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                      active
                        ? 'bg-[#F6C56E]/15 border-[#F6C56E] text-[#FFF8F0]'
                        : 'bg-[#0E1530] border-white/10 text-[#CBD5E1] hover:border-white/25'
                    }`}
                  >
                    <KrathongArtwork
                      style={item.id}
                      flowerColor={draft.flowerColor}
                      candleColor={draft.candleColor}
                      size="sm"
                      showRipples={false}
                      className="!w-12 !h-12 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-display text-sm font-medium truncate">
                        {item.label}
                      </div>
                      <div className="text-xs text-[#94A3B8] line-clamp-1">
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Flower Color & Candle Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <span className="block font-display text-sm font-medium text-[#FFF8F0]">
                2. สีดอกไม้ประดับ
              </span>
              <div className="flex flex-wrap gap-2">
                {FLOWER_COLOR_OPTIONS.map((color) => {
                  const active = draft.flowerColor === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() =>
                        onChangeDraft((prev) => ({ ...prev, flowerColor: color.id }))
                      }
                      title={color.label}
                      aria-label={color.label}
                      className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-white/10 border-[#F6C56E] text-white'
                          : 'bg-[#0E1530] border-white/10 text-[#CBD5E1] hover:border-white/25'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/30"
                        style={{ backgroundColor: color.primaryHex }}
                      />
                      <span>{color.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="block font-display text-sm font-medium text-[#FFF8F0]">
                3. สีแสงเทียนอธิษฐาน
              </span>
              <div className="flex flex-wrap gap-2">
                {CANDLE_COLOR_OPTIONS.map((candle) => {
                  const active = draft.candleColor === candle.id;
                  return (
                    <button
                      key={candle.id}
                      type="button"
                      onClick={() =>
                        onChangeDraft((prev) => ({ ...prev, candleColor: candle.id }))
                      }
                      className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-white/10 border-[#F6C56E] text-white'
                          : 'bg-[#0E1530] border-white/10 text-[#CBD5E1] hover:border-white/25'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: candle.flameHex,
                          boxShadow: `0 0 8px ${candle.glowHex}`,
                        }}
                      />
                      <span>{candle.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Recipient & Sender Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="block text-xs font-medium text-[#CBD5E1]">
                ถึงคนพิเศษ *
              </span>
              <input
                type="text"
                required
                maxLength={KRATHONG_LIMITS.toNameMax}
                value={draft.toName}
                onChange={(e) =>
                  onChangeDraft((prev) => ({ ...prev, toName: e.target.value }))
                }
                placeholder="ชื่อแฟน / คนพิเศษ"
                className="w-full min-h-[44px] rounded-xl bg-[#0E1530] border border-white/15 px-3.5 py-2.5 text-sm text-[#FFF8F0] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#F6C56E]/60"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="block text-xs font-medium text-[#CBD5E1]">
                จากคุณ *
              </span>
              <input
                type="text"
                required
                maxLength={KRATHONG_LIMITS.fromNameMax}
                value={draft.fromName}
                onChange={(e) =>
                  onChangeDraft((prev) => ({ ...prev, fromName: e.target.value }))
                }
                placeholder="ชื่อของคุณ"
                className="w-full min-h-[44px] rounded-xl bg-[#0E1530] border border-white/15 px-3.5 py-2.5 text-sm text-[#FFF8F0] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#F6C56E]/60"
              />
            </label>
          </div>

          {/* 4. Wish Text + Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="wish-textarea"
                className="text-xs font-medium text-[#CBD5E1]"
              >
                คำอธิษฐานลอยกระทง *
              </label>
              <span className="text-xs text-[#94A3B8] tabular-nums">
                {draft.wishText.length}/{KRATHONG_LIMITS.wishTextMax}
              </span>
            </div>
            <textarea
              id="wish-textarea"
              required
              rows={3}
              maxLength={KRATHONG_LIMITS.wishTextMax}
              value={draft.wishText}
              onChange={(e) =>
                onChangeDraft((prev) => ({ ...prev, wishText: e.target.value }))
              }
              placeholder="เขียนคำอธิษฐานสำหรับคืนวันเพ็ญนี้..."
              className="w-full rounded-xl bg-[#0E1530] border border-white/15 px-3.5 py-2.5 text-sm text-[#FFF8F0] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#F6C56E]/60"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {WISH_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    onChangeDraft((prev) => ({ ...prev, wishText: preset }))
                  }
                  className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#E2E8F0] transition-colors text-left"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Love Note + Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="lovenote-textarea"
                className="text-xs font-medium text-[#CBD5E1]"
              >
                ข้อความบอกรัก / ความในใจถึงแฟน (ไม่บังคับ)
              </label>
              <span className="text-xs text-[#94A3B8] tabular-nums">
                {draft.loveNote.length}/{KRATHONG_LIMITS.loveNoteMax}
              </span>
            </div>
            <textarea
              id="lovenote-textarea"
              rows={2}
              maxLength={KRATHONG_LIMITS.loveNoteMax}
              value={draft.loveNote}
              onChange={(e) =>
                onChangeDraft((prev) => ({ ...prev, loveNote: e.target.value }))
              }
              placeholder="ฝากข้อความน่ารักๆ ไว้ให้คนพิเศษเปิดอ่าน..."
              className="w-full rounded-xl bg-[#0E1530] border border-white/15 px-3.5 py-2.5 text-sm text-[#FFF8F0] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#F497B6]/60"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {LOVE_NOTE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    onChangeDraft((prev) => ({ ...prev, loveNote: preset }))
                  }
                  className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-[#F497B6]/10 hover:bg-[#F497B6]/20 border border-[#F497B6]/25 text-xs text-[#FDE2EC] transition-colors text-left"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Couple Memory Photo */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#CBD5E1]">
                แนบรูปภาพความทรงจำคู่กัน (ไม่บังคับ)
              </span>
              <div className="inline-flex rounded-lg bg-[#0E1530] p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    imageMode === 'upload'
                      ? 'bg-white/15 text-white'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  อัปโหลดรูป
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    imageMode === 'url'
                      ? 'bg-white/15 text-white'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  วางลิงก์รูป
                </button>
              </div>
            </div>

            {imageMode === 'upload' ? (
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isCompressing}
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E1530] hover:bg-[#19234A] border border-dashed border-white/25 text-xs sm:text-sm text-[#E2E8F0] transition-colors"
                >
                  <ImagePlus className="w-4 h-4 text-[#F6C56E]" />
                  <span>
                    {isCompressing
                      ? 'กำลังย่อขนาดรูปภาพ...'
                      : 'เลือกรูปคู่จากเครื่อง (ย่อขนาดให้อัตโนมัติ)'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={draft.imageData.startsWith('data:') ? '' : draft.imageData}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/our-memory.jpg"
                  className="w-full min-h-[44px] rounded-xl bg-[#0E1530] border border-white/15 pl-10 pr-3.5 py-2.5 text-sm text-[#FFF8F0] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#F6C56E]/60"
                />
              </div>
            )}

            {imageError && (
              <p className="text-xs text-[#FCA5A5]">{imageError}</p>
            )}

            {draft.imageData && isValidImageInput(draft.imageData) && (
              <div className="relative inline-flex items-center gap-3 p-2 rounded-xl bg-[#0E1530] border border-white/15">
                <img
                  src={draft.imageData}
                  alt="ภาพความทรงจำที่จะแนบไปกับกระทง"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="text-xs text-[#CBD5E1] pr-2">
                  <p className="font-medium text-[#FFF8F0]">แนบภาพความทรงจำแล้ว</p>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeDraft((prev) => ({ ...prev, imageData: '' }))
                    }
                    className="mt-1 inline-flex items-center gap-1 text-[#FCA5A5] hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบรูปนี้</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl bg-[#7F1D1D]/40 border border-[#FCA5A5]/40 px-4 py-3 text-xs sm:text-sm text-[#FECACA]"
            >
              {errorMessage}
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#F6C56E] to-[#F497B6] hover:brightness-105 text-[#0B1024] font-display font-semibold text-base shadow-xl shadow-[#F6C56E]/20 transition-all active:scale-[0.99] disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>กำลังปล่อยกระทงลงสู่สายน้ำ...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ลอยกระทงลงสู่สายน้ำ</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
