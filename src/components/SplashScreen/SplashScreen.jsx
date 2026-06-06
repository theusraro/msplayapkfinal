import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../../store/appStore.js'

const SplashScreen = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAppStore(s => s.isAuthenticated)

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isAuthenticated ? '/home' : '/login', { replace: true })
    }, 2800)
    return () => clearTimeout(timer)
  }, [navigate, isAuthenticated])

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      {/* Fundo com gradiente radial */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, #1a0000 0%, #000000 70%)' }} />

      {/* Logo wrapper com animação */}
      <div className="relative z-10 flex flex-col items-center splash-logo">

        {/* Ícone M com play */}
        <div className="relative mb-2">
          <svg viewBox="0 0 120 120" width="120" height="120" className="splash-glow">
            <defs>
              <linearGradient id="splashRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FF1A27' }} />
                <stop offset="100%" style={{ stopColor: '#8B0000' }} />
              </linearGradient>
              <filter id="splashGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Hexágono de fundo */}
            <polygon
              points="60,5 110,32.5 110,87.5 60,115 10,87.5 10,32.5"
              fill="#1a0000"
              stroke="#E50914"
              strokeWidth="2"
            />
            {/* M shape */}
            <path
              d="M25 85 L25 35 L42 35 L60 65 L78 35 L95 35 L95 85 L80 85 L80 58 L62 82 L58 82 L40 58 L40 85 Z"
              fill="url(#splashRed)"
              filter="url(#splashGlow)"
            />
            {/* Play triangle */}
            <polygon points="44,46 44,70 65,58" fill="white" opacity="0.9" />
          </svg>

          {/* Scan line */}
          <div className="absolute inset-0 overflow-hidden rounded">
            <div
              className="absolute top-0 bottom-0 w-16 scan-line"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                left: '-64px',
              }}
            />
          </div>
        </div>

        {/* Texto MSPlay */}
        <div className="relative overflow-hidden">
          <h1
            className="font-bebas text-7xl tracking-widest splash-glow"
            style={{ color: '#fff', letterSpacing: '0.15em' }}
          >
            <span style={{ color: '#E50914' }}>MS</span>
            <span>Play</span>
          </h1>
          {/* Linha vermelha scan no texto */}
          <div
            className="absolute top-0 bottom-0 w-8 scan-line"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(229,9,20,0.5), transparent)',
              left: '-32px',
              animationDelay: '0.8s',
            }}
          />
        </div>

        <p className="text-muted text-sm font-dm mt-3 tracking-[0.3em] uppercase animate-fade-in"
          style={{ animationDelay: '1s' }}>
          Sua plataforma IPTV
        </p>
      </div>

      {/* Barra de progresso na base */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface overflow-hidden">
        <div
          className="h-full bg-primary"
          style={{ animation: 'splashProgress 2.6s linear forwards' }}
        />
      </div>

      <style>{`
        @keyframes splashProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}

export default SplashScreen
