import React from 'react'

const Logo = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: { width: 110, height: 30 },
    md: { width: 160, height: 44 },
    lg: { width: 220, height: 60 },
    xl: { width: 320, height: 87 },
  }
  const { width, height } = sizes[size] || sizes.md

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" width={width} height={height}>
        <defs>
          <linearGradient id={`redGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF1A27', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#B81D24', stopOpacity: 1 }} />
          </linearGradient>
          <filter id={`glow-${size}`}>
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* M com play integrado */}
        <g filter={`url(#glow-${size})`}>
          <path
            d="M8 48 L8 12 L22 12 L33 32 L44 12 L58 12 L58 48 L48 48 L48 26 L36 46 L30 46 L18 26 L18 48 Z"
            fill={`url(#redGrad-${size})`}
          />
          <polygon points="24,20 24,38 38,29" fill="white" opacity="0.95" />
        </g>
        {/* S */}
        <text x="68" y="47" fontFamily="'Bebas Neue', sans-serif" fontSize="42"
          fill={`url(#redGrad-${size})`} filter={`url(#glow-${size})`}>S</text>
        {/* Play */}
        <text x="93" y="47" fontFamily="'Bebas Neue', sans-serif" fontSize="42" fill="white">Play</text>
      </svg>
    </div>
  )
}

export default Logo
