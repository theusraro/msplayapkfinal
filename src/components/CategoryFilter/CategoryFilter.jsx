import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const CategoryFilter = ({ categories = [], selected, onSelect }) => {
  const ref = useRef(null)

  const scroll = (dir) => {
    ref.current?.scrollBy({ left: dir === 'r' ? 200 : -200, behavior: 'smooth' })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') scroll('r')
    if (e.key === 'ArrowLeft') scroll('l')
  }

  const all = [{ category_id: '', category_name: 'Todos' }, ...categories]

  return (
    <div className="relative flex items-center gap-1">
      <button onClick={() => scroll('l')} className="flex-shrink-0 p-2 text-muted hover:text-white focus-tv rounded-full" aria-label="Categorias anteriores">
        <ChevronLeft size={18} />
      </button>

      <div ref={ref} onKeyDown={handleKeyDown} className="flex gap-2 overflow-x-auto content-row-scroll py-1">
        {all.map(cat => (
          <button
            key={cat.category_id}
            onClick={() => onSelect(cat.category_id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold
              transition-all duration-200 border font-dm whitespace-nowrap focus-tv
              ${selected === cat.category_id
                ? 'bg-primary border-primary text-white'
                : 'bg-transparent border-border text-muted hover:text-white hover:border-white/40'
              }`}
          >
            {cat.category_name}
          </button>
        ))}
      </div>

      <button onClick={() => scroll('r')} className="flex-shrink-0 p-2 text-muted hover:text-white focus-tv rounded-full" aria-label="Proximas categorias">
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

export default CategoryFilter
