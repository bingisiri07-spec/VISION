import React from 'react';

/**
 * SpaceBackdrop
 * 100% pure CSS and SVG celestial space environment.
 * Recreates the deep midnight navy void, luminous cosmic nebula,
 * starfield particles, and glowing curved planetary horizon
 * without any external photographic assets or watermarks.
 */
export default function SpaceBackdrop() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        background: '#01040d',
      }}
    >
      {/* 1. Deep space base gradients & nebula clouds */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 70% 60% at 75% 35%, rgba(29, 114, 254, 0.22) 0%, rgba(14, 38, 92, 0.12) 40%, transparent 75%),
            radial-gradient(circle 500px at 85% 25%, rgba(56, 189, 248, 0.18) 0%, transparent 65%),
            radial-gradient(circle 600px at 60% 60%, rgba(13, 27, 62, 0.6) 0%, transparent 70%),
            radial-gradient(ellipse 80% 50% at 20% 80%, rgba(7, 18, 43, 0.7) 0%, transparent 60%),
            linear-gradient(135deg, #01040d 0%, #020718 40%, #030c24 75%, #01040e 100%)
          `,
        }}
      />

      {/* 2. Cosmic dust & nebula illumination */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '75%',
          height: '85%',
          background: 'radial-gradient(circle at 70% 40%, rgba(56, 189, 248, 0.14) 0%, rgba(29, 114, 254, 0.1) 35%, transparent 70%)',
          filter: 'blur(40px)',
          opacity: 0.85,
        }}
      />

      {/* 3. SVG Planetary Horizon & Starfield */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Atmospheric outer glow gradient */}
          <radialGradient id="atmoGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.65" />
            <stop offset="55%" stopColor="#1d72fe" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#01040e" stopOpacity="0" />
          </radialGradient>

          {/* Planetary dark surface gradient */}
          <radialGradient id="planetSurface" cx="80%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#0b2347" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#040e22" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#010511" stopOpacity="1" />
            <stop offset="100%" stopColor="#01030a" stopOpacity="1" />
          </radialGradient>

          {/* Linear rim lighting along the limb */}
          <linearGradient id="rimBeam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#1d72fe" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
          </linearGradient>

          {/* Glow filter for the planetary edge */}
          <filter id="rimGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" result="blur1" />
            <feGaussianBlur stdDeviation="24" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Scattered Starfield (Varied coordinates, opacities, and sizes) */}
        <g opacity="0.75">
          <circle cx="8%" cy="12%" r="1" fill="#ffffff" style={{ animation: 'starTwinkle 4s ease-in-out infinite' }} />
          <circle cx="16%" cy="28%" r="1.3" fill="#bae6fd" style={{ animation: 'starTwinkle 6s ease-in-out infinite 1s' }} />
          <circle cx="22%" cy="8%" r="0.8" fill="#ffffff" />
          <circle cx="34%" cy="19%" r="1.2" fill="#ffffff" style={{ animation: 'starTwinkle 5s ease-in-out infinite 2s' }} />
          <circle cx="45%" cy="32%" r="1" fill="#7dd3fc" />
          <circle cx="52%" cy="14%" r="1.5" fill="#38bdf8" style={{ filter: 'drop-shadow(0 0 4px #38bdf8)', animation: 'starTwinkle 7s ease-in-out infinite 0.5s' }} />
          <circle cx="61%" cy="25%" r="0.9" fill="#ffffff" />
          <circle cx="68%" cy="11%" r="1.4" fill="#bae6fd" style={{ animation: 'starTwinkle 5s ease-in-out infinite 2.5s' }} />
          <circle cx="78%" cy="22%" r="1.8" fill="#67e8f9" style={{ filter: 'drop-shadow(0 0 6px #67e8f9)' }} />
          <circle cx="84%" cy="9%" r="1" fill="#ffffff" />
          <circle cx="92%" cy="18%" r="1.2" fill="#93c5fd" />
          
          <circle cx="12%" cy="65%" r="0.9" fill="#ffffff" />
          <circle cx="25%" cy="75%" r="1.3" fill="#ffffff" style={{ animation: 'starTwinkle 6s ease-in-out infinite 1.5s' }} />
          <circle cx="38%" cy="85%" r="1" fill="#7dd3fc" />
          <circle cx="48%" cy="70%" r="0.8" fill="#ffffff" />
          <circle cx="58%" cy="52%" r="1.2" fill="#bae6fd" />
          <circle cx="72%" cy="45%" r="1.4" fill="#38bdf8" />
        </g>

        {/* 4. Atmospheric Outer Halo (Soft diffuse cyan/electric glow) */}
        <ellipse
          cx="108%"
          cy="92%"
          rx="58vw"
          ry="58vw"
          fill="none"
          stroke="url(#atmoGlowGrad)"
          strokeWidth="60"
          opacity="0.45"
          filter="url(#rimGlowFilter)"
        />

        {/* 5. Sharp Atmospheric Rim Light (The radiant blue edge of Earth) */}
        <ellipse
          cx="108%"
          cy="92%"
          rx="56vw"
          ry="56vw"
          fill="none"
          stroke="url(#rimBeam)"
          strokeWidth="4.5"
          filter="url(#rimGlowFilter)"
          opacity="0.95"
        />

        {/* Secondary thinner brilliant highlight along the horizon */}
        <ellipse
          cx="108%"
          cy="92%"
          rx="55.8vw"
          ry="55.8vw"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
          opacity="0.85"
        />

        {/* 6. Planetary Body Surface (Deep dark curved body receding downwards to the right) */}
        <ellipse
          cx="108%"
          cy="92%"
          rx="55.6vw"
          ry="55.6vw"
          fill="url(#planetSurface)"
        />
      </svg>

      {/* 7. Foreground Vignette to ensure text readability on the left */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(90deg, #01040d 0%, rgba(1, 4, 13, 0.85) 30%, rgba(1, 4, 13, 0.4) 65%, transparent 100%),
            linear-gradient(180deg, rgba(1, 4, 13, 0.7) 0%, transparent 20%, transparent 75%, #01040d 100%)
          `,
        }}
      />
    </div>
  );
}
