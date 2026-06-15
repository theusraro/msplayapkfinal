import React, { useState } from 'react'
import { Play, Heart, Info, Tv } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { imgFallback, truncate } from '../../utils/helpers.js'
import useAppStore from '../../store/appStore.js'

const ContentCard = ({ item, type = 'movie', ratio = 'landscape' }) => {
  const navigate = useNavigate()
  const { toggleFavorite, isFavorite, addToast } = useAppStore()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [imgError, setImgError] = useState(false)

  const isLive = type === 'live'
  const favType = type === 'live' ? 'channels' : type === 'movie' ? 'movies' : 'series'
  const itemId = item.stream_id || item.series_id || item.id
  const fav = isFavorite(favType, itemId)

  const handlePlay = (e) => {
    e.stopPropagation()
    navigate('/player', { state: { item, type } })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handlePlay(e)
    }
  }

  const handleFav = (e) => {
    e.stopPropagation()
    const added = toggleFavorite(favType, { ...item, id: itemId })
    addToast({
      type: added ? 'success' : 'info',
      message: added ? `"${item.name}" adicionado aos favoritos` : `"${item.name}" removido dos favoritos`,
    })
  }

  const thumbnail = imgError ? null : (item.stream_icon || item.cover || item.backdrop_path || item.poster_path)
  const aspectClass = ratio === 'portrait' ? 'aspect-[2/3]' : 'aspect-video'

  return (
    <div
      className={`relative flex-shrink-0 rounded-lg overflow-hidden cursor-pointer group focus-tv
        transition-all duration-200 hover:scale-105 focus-visible:scale-105 hover:z-10 focus-visible:z-10 bg-surface`}
      style={{ width: ratio === 'portrait' ? '140px' : '220px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={handlePlay}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={`Assistir ${item.name}`}
    >
      {/* Thumbnail */}
      <div className={`${aspectClass} bg-elevated w-full relative`}>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => { imgFallback(e); setImgError(true) }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv size={28} className="text-muted" />
          </div>
        )}

        {/* Live badge */}
        {isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 badge-live">
            <span className="w-1.5 h-1.5 rounded-full bg-white live-indicator inline-block" />
            AO VIVO
          </div>
        )}

        {/* Quality badge */}
        {item.rating && !isLive && (
          <div className="absolute top-2 right-2 badge-quality">
            ⭐ {parseFloat(item.rating).toFixed(1)}
          </div>
        )}

        {/* Progress bar */}
        {item.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.min(item.progress * 100, 100)}%` }}
            />
          </div>
        )}

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/70 flex items-center justify-center gap-2
          transition-opacity duration-200 ${hovered || focused ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handlePlay}
            className="w-10 h-10 rounded-full bg-primary hover:bg-secondary flex items-center justify-center focus-tv
              transition-transform hover:scale-110"
            aria-label={`Assistir ${item.name}`}
          >
            <Play size={18} fill="white" className="text-white ml-0.5" />
          </button>
          <button
            onClick={handleFav}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center
              transition-all hover:scale-110 focus-tv
              ${fav ? 'border-primary bg-primary/20' : 'border-white/40 bg-black/40 hover:border-white'}`}
            aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart
              size={15}
              className={fav ? 'text-primary' : 'text-white'}
              fill={fav ? '#E50914' : 'none'}
            />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-white text-xs font-medium leading-tight truncate">{item.name}</p>
        {item.category_name && (
          <p className="text-muted text-xs mt-0.5 truncate">{item.category_name}</p>
        )}
      </div>
    </div>
  )
}

export default ContentCard
