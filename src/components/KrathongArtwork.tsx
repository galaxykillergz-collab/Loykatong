import React from 'react';
import {
  CANDLE_COLOR_OPTIONS,
  FLOWER_COLOR_OPTIONS,
  type CandleColor,
  type FlowerColor,
  type KrathongStyle,
} from '@/src/types/krathong';

interface KrathongArtworkProps {
  style: KrathongStyle;
  flowerColor: FlowerColor;
  candleColor: CandleColor;
  size?: 'sm' | 'md' | 'lg';
  showRipples?: boolean;
  className?: string;
}

export const KrathongArtwork: React.FC<KrathongArtworkProps> = ({
  style,
  flowerColor,
  candleColor,
  size = 'md',
  showRipples = true,
  className = '',
}) => {
  const flower =
    FLOWER_COLOR_OPTIONS.find((f) => f.id === flowerColor) ?? FLOWER_COLOR_OPTIONS[0];
  const candle =
    CANDLE_COLOR_OPTIONS.find((c) => c.id === candleColor) ?? CANDLE_COLOR_OPTIONS[0];

  const dimensions =
    size === 'sm' ? 'w-24 h-24' : size === 'lg' ? 'w-48 h-48 sm:w-56 sm:h-56' : 'w-32 h-32';

  // Unique SVG gradient IDs per color/style combination to avoid ID collisions
  const uid = `${style}-${flowerColor}-${candleColor}`;

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${dimensions} ${className}`}>
      {/* Animated water ripple rings */}
      {showRipples && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[88%] h-[22%]"
        >
          <span
            className="animate-ripple absolute inset-0 rounded-full border border-[#A5B4FC]/40"
          />
          <span
            className="animate-ripple absolute inset-0 rounded-full border border-[#F6C56E]/30"
            style={{ animationDelay: '1.6s' }}
          />
        </div>
      )}

      {/* Soft candlelight ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[6%] left-1/2 -translate-x-1/2 w-[54%] h-[46%] rounded-full blur-xl opacity-55 transition-colors duration-300"
        style={{ backgroundColor: candle.glowHex }}
      />

      <svg
        viewBox="0 0 200 190"
        className="relative z-10 w-full h-full drop-shadow-[0_10px_18px_rgba(6,10,28,0.55)]"
        role="img"
        aria-label={`กระทงแบบ${style}`}
      >
        <defs>
          <radialGradient id={`glow-${uid}`} cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="45%" stopColor={candle.flameHex} stopOpacity="0.9" />
            <stop offset="100%" stopColor={candle.glowHex} stopOpacity="0" />
          </radialGradient>

          <linearGradient id={`leaf-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="55%" stopColor="#2F855A" />
            <stop offset="100%" stopColor="#1B4332" />
          </linearGradient>

          <linearGradient id={`lotus-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE4EF" />
            <stop offset="55%" stopColor="#F48FB1" />
            <stop offset="100%" stopColor="#BE4B7B" />
          </linearGradient>

          <linearGradient id={`macaron-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE2E4" />
            <stop offset="50%" stopColor="#F8C8DC" />
            <stop offset="100%" stopColor="#E2CFEA" />
          </linearGradient>

          <linearGradient id={`royal-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="55%" stopColor="#F7E3AF" />
            <stop offset="100%" stopColor="#C9973E" />
          </linearGradient>
        </defs>

        {/* Water shadow ellipse */}
        <ellipse cx="100" cy="160" rx="70" ry="12" fill="#070D22" fillOpacity="0.52" />

        {/* Style 1: Banana Leaf Classic */}
        {style === 'banana-leaf' && (
          <g>
            {/* Outer folded leaf tips */}
            {[-54, -36, -18, 0, 18, 36, 54].map((dx, i) => (
              <path
                key={i}
                d={`M ${100 + dx} 102 L ${88 + dx} 134 L ${112 + dx} 134 Z`}
                fill={i % 2 === 0 ? '#38A169' : '#2F855A'}
                stroke="#A7F3D0"
                strokeWidth="0.8"
                strokeOpacity="0.5"
              />
            ))}
            {/* Main wrapped banana trunk base */}
            <path
              d="M 32 130 C 32 152, 168 152, 168 130 L 158 152 C 158 166, 42 166, 42 152 Z"
              fill={`url(#leaf-${uid})`}
            />
            <ellipse cx="100" cy="130" rx="68" ry="16" fill="#276749" stroke="#6EE7B7" strokeWidth="1" strokeOpacity="0.45" />
            <ellipse cx="100" cy="128" rx="54" ry="11" fill="#48BB78" fillOpacity="0.35" />
          </g>
        )}

        {/* Style 2: Pink Lotus */}
        {style === 'pink-lotus' && (
          <g>
            {/* Green lily pad base */}
            <ellipse cx="100" cy="148" rx="72" ry="15" fill="#2F855A" stroke="#6EE7B7" strokeWidth="1" strokeOpacity="0.4" />
            {/* Back lotus petals */}
            {[-46, -24, 0, 24, 46].map((dx, i) => (
              <path
                key={i}
                d={`M ${100 + dx * 0.7} 142 Q ${100 + dx * 1.45} 102 ${100 + dx} 98 Q ${100 + dx * 0.5} 108 ${100 + dx * 0.35} 142 Z`}
                fill={`url(#lotus-${uid})`}
                stroke="#FFF0F5"
                strokeWidth="0.9"
                strokeOpacity="0.6"
              />
            ))}
            {/* Front inner petals */}
            {[-30, -10, 10, 30].map((dx, i) => (
              <path
                key={i}
                d={`M ${100 + dx * 0.6} 146 Q ${100 + dx * 1.3} 112 ${100 + dx} 108 Q ${100 + dx * 0.4} 118 ${100 + dx * 0.25} 146 Z`}
                fill="#FBCFE8"
                stroke="#FFFFFF"
                strokeWidth="0.8"
                strokeOpacity="0.65"
              />
            ))}
            <ellipse cx="100" cy="138" rx="50" ry="12" fill="#F472B6" fillOpacity="0.45" />
          </g>
        )}

        {/* Style 3: Sweet Macaron & Bread Eco Krathong */}
        {style === 'sweet-macaron' && (
          <g>
            {/* Pastel wafer bowl base */}
            <path
              d="M 36 128 C 36 156, 164 156, 164 128 L 152 154 C 142 166, 58 166, 48 154 Z"
              fill="#F3D5B5"
              stroke="#FFF8F0"
              strokeWidth="1.2"
            />
            <ellipse cx="100" cy="128" rx="64" ry="15" fill={`url(#macaron-${uid})`} stroke="#FFF8F0" strokeWidth="1.2" />
            {/* Cute pastel macaron puffs around the rim */}
            {[
              { x: 48, y: 126, c: '#F9BEC7' },
              { x: 72, y: 134, c: '#FDE4CF' },
              { x: 100, y: 137, c: '#CDEAC0' },
              { x: 128, y: 134, c: '#D8BBFF' },
              { x: 152, y: 126, c: '#A0C4FF' },
            ].map((mac, idx) => (
              <g key={idx}>
                <ellipse cx={mac.x} cy={mac.y} rx="12" ry="7" fill={mac.c} stroke="#FFFFFF" strokeWidth="0.8" />
                <ellipse cx={mac.x} cy={mac.y + 2} rx="11" ry="2.2" fill="#FFF8F0" fillOpacity="0.85" />
              </g>
            ))}
          </g>
        )}

        {/* Style 4: Golden Royal Cream */}
        {style === 'golden-royal' && (
          <g>
            {/* Scalloped golden rim */}
            {[-52, -35, -18, 0, 18, 35, 52].map((dx, i) => (
              <path
                key={i}
                d={`M ${100 + dx} 98 Q ${112 + dx} 118 ${108 + dx} 135 L ${92 + dx} 135 Q ${88 + dx} 118 ${100 + dx} 98 Z`}
                fill={`url(#royal-${uid})`}
                stroke="#FFFBEB"
                strokeWidth="0.9"
              />
            ))}
            <path
              d="M 34 132 C 34 154, 166 154, 166 132 L 154 154 C 142 166, 58 166, 46 154 Z"
              fill="#D4A34A"
              stroke="#FEF3C7"
              strokeWidth="1"
            />
            <ellipse cx="100" cy="132" rx="66" ry="14" fill="#FDE68A" fillOpacity="0.65" stroke="#FEF3C7" strokeWidth="1" />
          </g>
        )}

        {/* Flower Garlands / Floral Ring (Dynamic flowerColor) */}
        <g>
          {[
            { cx: 52, cy: 122, r: 8 },
            { cx: 68, cy: 128, r: 9 },
            { cx: 85, cy: 132, r: 8.5 },
            { cx: 100, cy: 133, r: 9.5 },
            { cx: 115, cy: 132, r: 8.5 },
            { cx: 132, cy: 128, r: 9 },
            { cx: 148, cy: 122, r: 8 },
          ].map((fl, i) => (
            <g key={i}>
              <circle cx={fl.cx} cy={fl.cy} r={fl.r} fill={flower.primaryHex} />
              <circle cx={fl.cx - 2} cy={fl.cy - 2} r={fl.r * 0.45} fill={flower.secondaryHex} fillOpacity="0.85" />
              <circle cx={fl.cx} cy={fl.cy} r={2.3} fill="#FEF08A" />
            </g>
          ))}
        </g>

        {/* Three Delicate Incense Sticks */}
        <g>
          <line x1="87" y1="120" x2="82" y2="66" stroke="#C08457" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="100" y1="120" x2="100" y2="61" stroke="#C08457" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="113" y1="120" x2="118" y2="66" stroke="#C08457" strokeWidth="2.2" strokeLinecap="round" />
          {/* Glowing incense tips */}
          <circle cx="82" cy="65" r="2.6" fill={candle.flameHex} className="animate-candle-flicker" />
          <circle cx="100" cy="60" r="2.8" fill={candle.flameHex} className="animate-candle-flicker" />
          <circle cx="118" cy="65" r="2.6" fill={candle.flameHex} className="animate-candle-flicker" />
        </g>

        {/* Center Candle */}
        <g>
          <rect
            x="94"
            y="84"
            width="12"
            height="38"
            rx="4"
            fill={candle.stickHex}
            stroke="#FFFFFF"
            strokeOpacity="0.6"
            strokeWidth="0.8"
          />
          <line x1="100" y1="78" x2="100" y2="85" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

          {/* Halo around candle flame */}
          <circle cx="100" cy="68" r="24" fill={`url(#glow-${uid})`} />

          {/* Animated flickering flame */}
          <g className="animate-candle-flicker">
            <path
              d="M 100 50 C 107 62, 108 73, 100 77 C 92 73, 93 62, 100 50 Z"
              fill={candle.flameHex}
            />
            <path
              d="M 100 59 C 103.5 66, 104 73, 100 75 C 96 73, 96.5 66, 100 59 Z"
              fill="#FFFFFF"
              fillOpacity="0.92"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
