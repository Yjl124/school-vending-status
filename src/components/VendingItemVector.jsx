import React from 'react';

export const VendingItemVector = ({ type, brandColor, accentColor, name }) => {
  // Common styling for a clean flat design look
  const strokeColor = "#191f28"; // charcoal border
  const strokeWidth = 3;

  switch (type) {
    case 'can':
      return (
        <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.05)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Metal Can Rim Top */}
          <rect x="25" y="10" width="50" height="6" rx="3" fill="#e5e8eb" stroke={strokeColor} strokeWidth={strokeWidth} />
          
          {/* Can Body */}
          <rect x="20" y="16" width="60" height="108" rx="8" fill={brandColor} stroke={strokeColor} strokeWidth={strokeWidth} />
          
          {/* Metal Can Rim Bottom */}
          <rect x="25" y="124" width="50" height="6" rx="3" fill="#b0b8c1" stroke={strokeColor} strokeWidth={strokeWidth} />
          
          {/* Shine Line */}
          <path d="M 28 22 L 28 118" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.2" />
          <path d="M 36 22 L 36 118" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.1" />

          {/* Central Label Badge */}
          <circle cx="50" cy="70" r="22" fill={accentColor} opacity="0.9" />
          
          {/* Minimal Brand Graphic / Text */}
          <path d="M 40 70 Q 50 60 60 70" stroke={brandColor} strokeWidth="4" strokeLinecap="round" />
          <path d="M 40 75 Q 50 65 60 75" stroke={brandColor} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </svg>
      );

    case 'bottle':
      return (
        <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.05)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bottle Cap */}
          <rect x="40" y="8" width="20" height="10" rx="2" fill={brandColor} stroke={strokeColor} strokeWidth={strokeWidth} />
          
          {/* Bottle Neck */}
          <path d="M 43 18 L 43 32 L 30 50 L 30 120 C 30 126 35 130 40 130 L 60 130 C 65 130 70 126 70 120 L 70 50 L 57 32 L 57 18 Z" 
                fill="#eef7fc" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
          
          {/* Water level shadow */}
          <path d="M 30 65 L 70 65 L 70 120 C 70 126 65 130 60 130 L 40 130 C 35 130 30 126 30 120 Z" 
                fill="#d2ecf9" opacity="0.5" />
          
          {/* Label */}
          <path d="M 30 70 L 70 70 L 70 95 L 30 95 Z" fill={brandColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
          
          {/* Label Design (Wave) */}
          <path d="M 34 82 Q 50 74 66 82" stroke={accentColor} strokeWidth="4" strokeLinecap="round" fill="none" />
          
          {/* Glass Shine */}
          <path d="M 35 55 L 35 115" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        </svg>
      );

    case 'bottle_round': // Cute yogurt-style round bottle
      return (
        <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.05)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Foil Cap / Lid */}
          <path d="M 30 25 L 70 25 L 75 16 L 25 16 Z" fill={accentColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <line x1="35" y1="20" x2="65" y2="20" stroke={strokeColor} strokeWidth="2" />
          
          {/* Body */}
          <path d="M 33 25 L 33 38 C 22 50 20 110 32 124 C 38 130 62 130 68 124 C 80 110 78 50 67 38 L 67 25 Z" 
                fill={brandColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
          
          {/* Shine */}
          <path d="M 28 65 Q 26 90 35 115" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
          
          {/* Minimal Label Badge */}
          <rect x="36" y="55" width="28" height="34" rx="4" fill="#ffffff" stroke={strokeColor} strokeWidth="2" />
          <path d="M 40 67 L 60 67" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M 44 75 L 56 75" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'box':
      return (
        <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.05)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Box Container */}
          <rect x="18" y="15" width="64" height="110" rx="6" fill={brandColor} stroke={strokeColor} strokeWidth={strokeWidth} />
          
          {/* Box Side Shadow (3D effect but flat) */}
          <path d="M 72 15 L 82 15 L 82 125 L 72 125 Z" fill="#000000" opacity="0.1" />
          
          {/* Diagonal Premium Pattern */}
          <path d="M 18 45 L 82 85" stroke={accentColor} strokeWidth="12" strokeLinecap="square" opacity="0.8" />
          <path d="M 18 65 L 82 105" stroke={accentColor} strokeWidth="6" strokeLinecap="square" opacity="0.4" />
          
          {/* Graphic */}
          <circle cx="50" cy="70" r="16" fill={brandColor} stroke={strokeColor} strokeWidth="2" />
          <circle cx="50" cy="70" r="10" fill={accentColor} />
          
          {/* Biscuit details inside circle */}
          <rect x="47" y="65" width="6" height="10" rx="1" fill={brandColor} />
        </svg>
      );

    case 'bag':
      return (
        <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.05)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bag Body */}
          <path d="M 22 25 C 22 18 78 18 78 25 L 82 70 L 78 115 C 78 122 22 122 22 115 L 18 70 Z" 
                fill={brandColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
          
          {/* Crimped Top Edge */}
          <path d="M 22 20 L 78 20" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M 25 18 L 25 22 M 35 18 L 35 22 M 45 18 L 45 22 M 55 18 L 55 22 M 65 18 L 65 22 M 75 18 L 75 22" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
          
          {/* Crimped Bottom Edge */}
          <path d="M 22 120 L 78 120" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M 25 118 L 25 122 M 35 118 L 35 122 M 45 118 L 45 122 M 55 118 L 55 122 M 65 118 L 65 122 M 75 118 L 75 122" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
          
          {/* Center Brand Shape */}
          <ellipse cx="50" cy="70" rx="20" ry="16" fill={accentColor} stroke={strokeColor} strokeWidth="2" />
          
          {/* Detail Inside */}
          <path d="M 42 70 L 58 70 M 50 62 L 50 78" stroke={brandColor} strokeWidth="3" strokeLinecap="round" />
          
          {/* Shine overlay */}
          <path d="M 25 35 Q 40 30 75 45" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.3" fill="none" />
        </svg>
      );

    case 'tube':
      return (
        <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.05)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Plastic Translucent Lid */}
          <ellipse cx="50" cy="18" rx="25" ry="6" fill="#ffffff" opacity="0.6" stroke={strokeColor} strokeWidth={strokeWidth} />
          
          {/* Cylinder Tube */}
          <path d="M 25 18 L 25 120 C 25 125 35 128 50 128 C 65 128 75 125 75 120 L 75 18" 
                fill={brandColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
          
          {/* Tube bottom rim */}
          <ellipse cx="50" cy="120" rx="25" ry="6" fill="#b0b8c1" stroke={strokeColor} strokeWidth={strokeWidth} />
          
          {/* Brand Accent Banner */}
          <path d="M 25 50 Q 50 60 75 50 L 75 75 Q 50 85 25 75 Z" fill={accentColor} stroke={strokeColor} strokeWidth="2" />
          
          {/* Stylized Logo (Mustache or Chip) */}
          <path d="M 42 63 C 45 61 48 61 50 63 C 52 61 55 61 58 63 C 60 67 55 72 50 70 C 45 72 40 67 42 63 Z" fill={strokeColor} />
          
          {/* Tubing Shine */}
          <path d="M 30 25 L 30 110" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.15" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 100 140" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="60" height="100" rx="10" fill="#e5e8eb" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="50" cy="70" r="15" fill="#b0b8c1" />
        </svg>
      );
  }
};
