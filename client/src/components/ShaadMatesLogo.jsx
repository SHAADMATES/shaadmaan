import React from 'react';

/**
 * Official Shaad Mates Brand Logo Component
 * Matches the user-provided emblem with Islamic arch, 8-point geometric star,
 * interlocking SM monogram, open book pages, and Arabic calligraphy.
 */
const ShaadMatesLogo = ({ 
  size = 'md', 
  variant = 'full', // 'full' (icon + text) | 'emblem' (icon only) | 'text' (text only)
  className = '',
  theme = 'auto' // 'auto' | 'light' | 'dark'
}) => {
  // Dimensions map
  const heights = {
    xs: 28,
    sm: 36,
    md: 46,
    lg: 58,
    xl: 72,
    hero: 92
  };

  const h = heights[size] || heights.md;
  const isEmblem = variant === 'emblem';
  const viewBox = isEmblem ? "0 0 160 180" : "0 0 520 180";
  const width = isEmblem ? Math.round(h * 0.88) : Math.round(h * 2.88);

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg 
        width={width} 
        height={h} 
        viewBox={viewBox} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300"
      >
        <defs>
          <linearGradient id="smGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F3D889"/>
            <stop offset="50%" stopColor="#C5A059"/>
            <stop offset="100%" stopColor="#9E782F"/>
          </linearGradient>
          
          <linearGradient id="smNavy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A5F"/>
            <stop offset="100%" stopColor="#0B1E36"/>
          </linearGradient>

          <linearGradient id="smNavyLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0"/>
            <stop offset="100%" stopColor="#FFFFFF"/>
          </linearGradient>
        </defs>

        {/* EMBLEM: ARCH + 8-POINT STAR + SM + OPEN BOOK */}
        <g transform={isEmblem ? "translate(0, 5)" : "translate(10, 5)"}>
          {/* Outer Arch Frame */}
          <path 
            d="M 80 8 C 45 8, 20 32, 20 75 L 20 135 L 30 135 L 30 75 C 30 38, 50 18, 80 18 C 110 18, 130 38, 130 75 L 130 135 L 140 135 L 140 75 C 140 32, 115 8, 80 8 Z" 
            fill="url(#smNavy)" 
            stroke="url(#smGold)" 
            strokeWidth="1.5"
            className="dark:fill-[#0F243E] dark:stroke-[#E5C158]"
          />

          {/* Inner Mihrab Point */}
          <path 
            d="M 80 14 Q 52 28 32 60 L 32 135 L 42 135 L 42 66 Q 58 38 80 24 Q 102 38 118 66 L 118 135 L 128 135 L 128 60 Q 108 28 80 14 Z" 
            fill="none" 
            stroke="url(#smGold)" 
            strokeWidth="1.4"
          />

          {/* Arabesque 8-Point Geometric Star */}
          <g transform="translate(80, 50) scale(0.92)">
            <polygon 
              points="0,-18 5,-7 17,-17 7,-5 18,0 7,5 17,17 5,7 0,18 -5,7 -17,17 -7,5 -18,0 -7,-5 -17,-17 -5,-7" 
              fill="url(#smGold)"
            />
            <circle cx="0" cy="0" r="4.8" fill="#0B1E36" stroke="url(#smGold)" strokeWidth="1.2"/>
            <path d="M 0 -24 L 8 -16 L 24 -16 L 16 -8 L 24 0 L 16 8 L 24 16 L 8 16 L 0 24 L -8 16 L -24 16 L -16 8 L -24 0 L -16 -8 L -24 -16 L -8 -16 Z" fill="none" stroke="url(#smGold)" strokeWidth="1.2" opacity="0.9"/>
          </g>

          {/* Interlocking "SM" Monogram */}
          <path 
            d="M 42 85 L 82 85 L 82 97 L 57 97 L 82 120 L 82 136 L 42 136 L 42 124 L 67 124 L 42 101 Z" 
            fill="url(#smNavy)"
            className="dark:fill-[#E2E8F0]"
          />
          <path 
            d="M 78 85 L 94 85 L 105 106 L 116 85 L 126 85 L 126 136 L 114 136 L 114 104 L 105 122 L 94 104 L 94 136 L 78 136 Z" 
            fill="url(#smNavy)"
            className="dark:fill-[#E2E8F0]"
          />

          {/* Open Book Base */}
          <path d="M 80 142 Q 52 132 16 146 Q 50 158 80 146 Q 110 158 144 146 Q 108 132 80 142 Z" fill="url(#smNavy)" className="dark:fill-[#0F243E]"/>
          <path d="M 80 148 Q 52 138 12 154 Q 50 166 80 154 Q 110 166 148 154 Q 108 138 80 148 Z" fill="url(#smGold)"/>
          <path d="M 80 156 Q 52 146 18 162 Q 50 174 80 162 Q 110 174 142 162 Q 108 146 80 156 Z" fill="url(#smNavy)" className="dark:fill-[#0F243E]"/>
          <polygon points="80,146 76,176 84,176" fill="url(#smGold)"/>
        </g>

        {/* FULL VARIANT: DIVIDER & TYPOGRAPHY */}
        {!isEmblem && (
          <>
            {/* Vertical Gold Divider */}
            <g transform="translate(185, 20)">
              <line x1="0" y1="5" x2="0" y2="135" stroke="url(#smGold)" strokeWidth="1.5"/>
              <polygon points="0,0 4,-5 0,-10 -4,-5" fill="url(#smGold)"/>
              <polygon points="0,70 6,64 0,58 -6,64" fill="url(#smGold)"/>
              <polygon points="0,140 4,145 0,150 -4,145" fill="url(#smGold)"/>
            </g>

            {/* Typography */}
            <g transform="translate(215, 30)">
              {/* SHAAD MATES */}
              <text 
                x="0" 
                y="40" 
                fontFamily="'Cinzel', 'Playfair Display', 'Times New Roman', serif" 
                fontSize="42" 
                fontWeight="900" 
                letterSpacing="2.5"
                fill="url(#smNavy)"
                className="dark:fill-white"
              >
                SHAAD MATES
              </text>

              {/* Arabic Script: شَاد مَاتس */}
              <g transform="translate(2, 74)">
                <polygon points="4,12 8,7 4,2 0,7" fill="url(#smGold)"/>
                <line x1="16" y1="7" x2="52" y2="7" stroke="url(#smGold)" strokeWidth="1.2"/>
                <text 
                  x="64" 
                  y="16" 
                  fontFamily="'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif" 
                  fontSize="32" 
                  fontWeight="bold" 
                  fill="url(#smNavy)"
                  className="dark:fill-[#F3D889]"
                >
                  شَاد مَاتس
                </text>
              </g>

              {/* Subtitle */}
              <g transform="translate(2, 114)">
                <line x1="0" y1="-8" x2="260" y2="-8" stroke="url(#smGold)" strokeWidth="0.8" opacity="0.6"/>
                <text 
                  x="0" 
                  y="8" 
                  fontFamily="'Outfit', 'Inter', sans-serif" 
                  fontSize="12" 
                  fontWeight="800" 
                  letterSpacing="4"
                  fill="url(#smNavy)"
                  className="dark:fill-slate-300"
                >
                  ISLAMIC EDUCATIONAL ACADEMY
                </text>
                <line x1="0" y1="18" x2="180" y2="18" stroke="url(#smGold)" strokeWidth="1"/>
              </g>
            </g>
          </>
        )}
      </svg>
    </div>
  );
};

export default ShaadMatesLogo;
