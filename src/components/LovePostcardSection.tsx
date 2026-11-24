import React from 'react';
import { Heart, ArrowRight, LogIn, ShieldCheck, LogOut } from 'lucide-react';
import { KRATHONG_LIMITS } from '@/src/types/krathong';
import { KrathongArtwork } from './KrathongArtwork';

interface LovePostcardSectionProps {
  toName: string;
  fromName: string;
  userEmail: string | null;
  isAdmin: boolean;
  authLoading: boolean;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  onChangeToName: (val: string) => void;
  onChangeFromName: (val: string) => void;
  onStartTogether: () => void;
  onExploreRiver: () => void;
}

export const LovePostcardSection: React.FC<LovePostcardSectionProps> = ({
  toName,
  fromName,
  userEmail,
  isAdmin,
  authLoading,
  onSignInGoogle,
  onSignOut,
  onChangeToName,
  onChangeFromName,
  onStartTogether,
  onExploreRiver,
}) => {
  const displayTo = toName.trim() || 'คนพิเศษของฉัน';
  const displayFrom = fromName.trim() || 'คนที่รักเธอ';

  return (
    <section
      aria-label="โปสการ์ดรักเปิดใจ"
      className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 pb-10 sm:pt-10 sm:pb-14"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Left: Warm Cream Romantic Love Postcard */}
        <div className="lg:col-span-7 rounded-3xl bg-[#FFF8F0] text-[#2B2233] p-6 sm:p-10 shadow-2xl shadow-[#050817]/50 border border-[#F6C56E]/35 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#8C6D62]">
              <div className="flex items-center gap-2">
                <span>ค่ำคืนวันเพ็ญขึ้น 15 ค่ำ เดือน 12</span>
                <span aria-hidden="true">·</span>
                <span>โปสการ์ดรักฉบับพิเศษ</span>
              </div>

              {userEmail ? (
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2B2233]/5 hover:bg-[#2B2233]/10 text-[#2B2233] font-medium transition-colors"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${isAdmin ? 'text-[#059669]' : 'text-[#6B5460]'}`} />
                  <span className="max-w-[150px] truncate">{userEmail}</span>
                  <LogOut className="w-3 h-3 text-[#8C6D62]" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={onSignInGoogle}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DFCBB8] hover:bg-[#F5E9DC] text-[#2B2233] font-medium transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#C84B78]" />
                  <span>{authLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ Gmail / Google'}</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              <h1
                className="font-display text-2xl sm:text-4xl font-semibold leading-snug text-[#2B2233]"
                style={{ textWrap: 'balance' }}
              >
                สุขสันต์วันลอยกระทงนะ{' '}
                <span className="text-[#C84B78] underline decoration-[#F497B6]/50 decoration-2 underline-offset-4">
                  {displayTo}
                </span>{' '}
                <span aria-hidden="true">💕</span>
              </h1>
              <p className="text-sm sm:text-base text-[#5C4B56] leading-relaxed max-w-xl">
                คืนนี้พระจันทร์เต็มดวงส่องสว่างบนผืนน้ำสีคราม อยากชวนเธอมาแต่งกระทงใบเล็กๆ
                เขียนคำอธิษฐานดีๆ แล้วลอยความรักของเราลงสู่สายน้ำไปด้วยกันนะ
              </p>
            </div>

            {/* Inline Quick Personalization Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="block space-y-1.5">
                <span className="block text-xs font-medium text-[#6B5460]">
                  ถึงคนพิเศษ (ชื่อแฟน)
                </span>
                <input
                  type="text"
                  maxLength={KRATHONG_LIMITS.toNameMax}
                  value={toName}
                  onChange={(e) => onChangeToName(e.target.value)}
                  placeholder="เช่น น้องพลอย, ที่รัก"
                  className="w-full min-h-[44px] rounded-xl bg-white border border-[#E6D5C3] px-3.5 py-2.5 text-sm text-[#2B2233] placeholder:text-[#B5A099] focus:outline-none focus:ring-2 focus:ring-[#E57399]/50 focus:border-[#E57399]"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="block text-xs font-medium text-[#6B5460]">
                  จากใจของ (ชื่อผู้ส่ง)
                </span>
                <input
                  type="text"
                  maxLength={KRATHONG_LIMITS.fromNameMax}
                  value={fromName}
                  onChange={(e) => onChangeFromName(e.target.value)}
                  placeholder="เช่น พี่วิน, เค้าเอง"
                  className="w-full min-h-[44px] rounded-xl bg-white border border-[#E6D5C3] px-3.5 py-2.5 text-sm text-[#2B2233] placeholder:text-[#B5A099] focus:outline-none focus:ring-2 focus:ring-[#E57399]/50 focus:border-[#E57399]"
                />
              </label>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#EADBC8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#7A616C]">
              <Heart className="w-4 h-4 text-[#D85A84] shrink-0" />
              <span>เขียนไว้ด้วยรักจาก {displayFrom}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onExploreRiver}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#DFCBB8] text-[#5C4B56] hover:bg-[#F5E9DC] transition-colors text-sm font-medium whitespace-nowrap shrink-0"
              >
                ชมผิวน้ำคืนเพ็ญ
              </button>
              <button
                type="button"
                onClick={onStartTogether}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D85A84] hover:bg-[#C44972] text-white font-medium text-sm shadow-lg shadow-[#D85A84]/25 transition-all active:scale-[0.98] whitespace-nowrap shrink-0"
              >
                <span>เริ่มลอยกระทงด้วยกัน</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Moonlit Preview Card */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-[#162044] via-[#121A3A] to-[#0C1430] border border-[#A5B4FC]/20 p-6 sm:p-8 flex flex-col items-center justify-between relative overflow-hidden min-h-[300px]">
          {/* Soft Full Moon in corner */}
          <div
            aria-hidden="true"
            className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[#FFF4CC]/90 blur-[2px] shadow-[0_0_70px_rgba(253,230,138,0.45)]"
          />
          <div
            aria-hidden="true"
            className="absolute top-6 left-10 w-1.5 h-1.5 rounded-full bg-[#FFF8F0]/70 animate-twinkle"
          />
          <div
            aria-hidden="true"
            className="absolute top-16 left-24 w-1 h-1 rounded-full bg-[#FDE68A]/70 animate-twinkle"
            style={{ animationDelay: '1.2s' }}
          />

          <div className="relative z-10 w-full text-left">
            <p className="text-xs text-[#CBD5E1]">ตัวอย่างกระทงคู่ใจ</p>
            <p className="font-display text-lg font-medium text-[#FFF8F0] mt-0.5">
              แสงเทียนอบอุ่นสำหรับคืนนี้
            </p>
          </div>

          <div className="relative z-10 my-4 animate-krathong-bob">
            <KrathongArtwork
              style="pink-lotus"
              flowerColor="pastel-pink"
              candleColor="warm-gold"
              size="lg"
              showRipples
            />
          </div>

          <div className="relative z-10 w-full flex items-center justify-between text-xs text-[#CBD5E1] pt-3 border-t border-white/10">
            <span>ถึง {displayTo}</span>
            <span className="text-[#FDE68A]">ลอยคู่กันใต้แสงจันทร์</span>
          </div>
        </div>
      </div>
    </section>
  );
};
