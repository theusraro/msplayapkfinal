import React, { useState, useEffect, useCallback } from 'react'
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { truncate, imgFallback } from '../../utils/helpers.js'

const HeroBanner = ({ items = [], type = 'movie' }) => {
  const [current, setCurrent] = useState(0)
  const [fade, setFade] = useState(true)
  const [paused, setPaused] = useState(false)
  const navigate = useNavigate()

  const goTo = useCallback((index) => {
    setFade(false)
    setTimeout(() => {
      setCurrent(index)
      setFade(true)
    }, 300)
  }, [])

  useEffect(() => {
    if (items.length <= 1 || paused) return
    const interval = setInterval(() => {
      goTo((current + 1) % items.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [current, items.length, paused, goTo])

  if (items.length === 0) {
    return (
      <div className="h-[60vh] bg-elevated flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-border border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-muted text-sm">Carregando destaques...</p>
        </div>
      </div>
    )
  }

  const item = items[current]
  const backdrop = item?.backdrop_path || item?.cover || item?.stream_icon

  return (
    <div
      className="relative h-[62vh] min-h-[400px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        {backdrop ? (
          <img
            src={backdrop}
            alt={item.name}
            className="w-full h-full object-cover object-center"
            onError={imgFallback}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-elevated to-dark" />
        )}
        {/* Gradiente hero */}
        <div className="absolute inset-0 hero-gradient" />
      </div>

      {/* Conteúdo */}
      <div className={`absolute inset-0 flex items-end pb-16 px-4 md:px-12 transition-all duration-500
        ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="max-w-xl">
          {/* Badge tipo */}
          <div className="flex items-center gap-2 mb-3">
            {type === 'live' && (
              <span className="badge-live flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full live-indicator" />AO VIVO
              </span>
            )}
            {item.rating && (
              <span className="text-yellow-400 text-sm font-semibold">
                ⭐ {parseFloat(item.rating).toFixed(1)}
              </span>
            )}
          </div>

          {/* Título */}
          <h1 className="font-bebas text-4xl md:text-6xl text-white leading-none mb-3 drop-shadow-lg">
            {item.name}
          </h1>

          {/* Descrição */}
          {item.plot && (
            <p className="text-white/80 text-sm md:text-base leading-relaxed mb-5 font-dm max-w-md">
              {truncate(item.plot, 140)}
            </p>
          )}

          {/* Botões */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/player', { state: { item, type } })}
              className="btn-primary text-sm md:text-base px-6 py-2.5 shadow-lg shadow-primary/20"
            >
              <Play size={18} fill="white" /> Assistir Agora
            </button>
            <button
              onClick={() => navigate('/player', { state: { item, type, info: true } })}
              className="btn-secondary text-sm md:text-base px-5 py-2.5"
            >
              <Info size={18} /> Mais Infos
            </button>
          </div>
        </div>
      </div>

      {/* Navegação */}
      {items.length > 1 && (
        <>
          <button
            onClick={() => goTo(current === 0 ? items.length - 1 : current - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
              bg-black/40 hover:bg-black/70 flex items-center justify-center
              text-white transition-all backdrop-blur-sm border border-white/10"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => goTo((current + 1) % items.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
              bg-black/40 hover:bg-black/70 flex items-center justify-center
              text-white transition-all backdrop-blur-sm border border-white/10"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all ${
                  i === current ? 'w-6 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default HeroBanner
