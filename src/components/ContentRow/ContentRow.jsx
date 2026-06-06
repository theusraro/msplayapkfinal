import React, { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ContentCard from '../ContentCard/ContentCard.jsx'

const ContentRow = ({ title, items = [], type = 'movie', ratio = 'landscape', loading = false }) => {
  const rowRef = useRef(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const scroll = (dir) => {
    const el = rowRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  const handleScroll = () => {
    const el = rowRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 10)
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
  }

  const skeletons = Array.from({ length: 6 })

  if (!loading && items.length === 0) return null

  return (
    <div className="relative mb-8 group/row">
      {/* Título */}
      <h2 className="section-title px-4 md:px-8 mb-3">{title}</h2>

      <div className="relative">
        {/* Seta esquerda */}
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center
              bg-gradient-to-r from-dark to-transparent opacity-0 group-hover/row:opacity-100
              transition-opacity hover:from-dark/90"
          >
            <ChevronLeft size={28} className="text-white drop-shadow-lg" />
          </button>
        )}

        {/* Seta direita */}
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center
              bg-gradient-to-l from-dark to-transparent opacity-0 group-hover/row:opacity-100
              transition-opacity hover:from-dark/90"
          >
            <ChevronRight size={28} className="text-white drop-shadow-lg" />
          </button>
        )}

        {/* Row de conteúdo */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto content-row-scroll px-4 md:px-8 pb-2"
        >
          {loading
            ? skeletons.map((_, i) => (
                <div
                  key={i}
                  className={`flex-shrink-0 rounded-lg bg-elevated animate-pulse
                    ${ratio === 'portrait' ? 'w-[140px] aspect-[2/3]' : 'w-[220px] aspect-video'}`}
                />
              ))
            : items.map((item, i) => (
                <ContentCard key={item.stream_id || item.series_id || item.id || i} item={item} type={type} ratio={ratio} />
              ))
          }
        </div>
      </div>
    </div>
  )
}

export default ContentRow
