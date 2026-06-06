import React, { useState, useMemo, useCallback } from 'react'
import { Search, Radio, Tv } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar.jsx'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner.jsx'
import useXtream from '../hooks/useXtream.js'
import { debounce, imgFallback } from '../utils/helpers.js'

const LiveTVPage = () => {
  const navigate = useNavigate()
  const [categoryId, setCategoryId] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useCallback(debounce(setSearch, 300), [])

  const { data: categories, loading: loadCats } = useXtream('live_categories')
  const { data: streams, loading: loadStreams } = useXtream('live_streams', { categoryId })

  const filtered = useMemo(() => {
    if (!streams) return []
    if (!search) return streams
    const q = search.toLowerCase()
    return streams.filter(s => s.name?.toLowerCase().includes(q))
  }, [streams, search])

  return (
    <div className="page-container flex">
      <Navbar />

      {/* Sidebar categorias */}
      <aside className="hidden md:flex flex-col w-40 lg:w-56 fixed left-0 top-16 bottom-0 bg-surface border-r border-border overflow-y-auto overflow-x-hidden z-30 pt-3">
        <p className="text-muted text-xs font-semibold uppercase tracking-widest px-4 mb-2">Categorias</p>
       <button
  onClick={() => setCategoryId('')}
  className={`px-3 lg:px-4 py-2 text-[12px] lg:text-sm leading-tight min-h-[36px] text-left transition-colors font-dm whitespace-normal break-words overflow-visible ${
    categoryId === '' ? 'text-white bg-primary/20 border-l-2 border-primary' : 'text-muted hover:text-white hover:bg-elevated'
  }`}
>
  Todos os canais
</button>
        {(categories || []).map(cat => (
  <button
    key={cat.category_id}
    onClick={() => setCategoryId(cat.category_id)}
    title={cat.category_name}
    className={`px-3 lg:px-4 py-2 text-[12px] lg:text-sm leading-tight min-h-[36px] text-left transition-colors font-dm whitespace-normal break-words overflow-visible ${
      categoryId === cat.category_id ? 'text-white bg-primary/20 border-l-2 border-primary' : 'text-muted hover:text-white hover:bg-elevated'
    }`}
  >
    {cat.category_name}
  </button>
))}
      </aside>

      {/* Conteúdo principal */}
<main className="flex-1 md:ml-40 lg:ml-56 pt-16 md:pt-20 px-2.5 md:px-4 lg:px-6 pb-10 md:pb-12 min-w-0">        {/* Header */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div>
            <h1 className="font-bebas text-3xl md:text-4xl text-white tracking-wide flex items-center gap-2">
              <Radio size={24} className="text-primary md:w-7 md:h-7" /> TV ao Vivo
            </h1>
            <p className="text-muted text-xs md:text-sm font-dm mt-0.5">
              {loadStreams ? 'Carregando...' : `${filtered.length} canal${filtered.length !== 1 ? 'is' : ''} disponíve${filtered.length !== 1 ? 'is' : 'l'}`}
            </p>
          </div>
        </div>

        {/* Busca mobile */}
        <div className="relative mb-3 md:mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            onChange={e => debouncedSearch(e.target.value)}
            placeholder="Buscar canal..."
            className="input-field pl-9"
          />
        </div>

        {/* Categorias mobile */}
        <div className="flex md:hidden gap-2 overflow-x-auto content-row-scroll pb-2 mb-2">
          <button
            onClick={() => setCategoryId('')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${categoryId === '' ? 'bg-primary border-primary text-white' : 'border-border text-muted hover:text-white'}`}
          >
            Todos
          </button>
          {(categories || []).map(cat => (
            <button
              key={cat.category_id}
              onClick={() => setCategoryId(cat.category_id)}
              className={`flex-shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-medium border transition-all whitespace-nowrap
                ${categoryId === cat.category_id ? 'bg-primary border-primary text-white' : 'border-border text-muted hover:text-white'}`}
            >
              {cat.category_name}
            </button>
          ))}
        </div>

        {/* Grid de canais */}
        {loadStreams ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Carregando canais..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Tv size={40} className="text-muted mx-auto mb-3" />
            <p className="text-muted">Nenhum canal encontrado</p>
          </div>
        ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">            {filtered.map(ch => (
              <button
                key={ch.stream_id}
                onClick={() => navigate('/player', { state: { item: ch, type: 'live' } })}
                className="group bg-surface hover:bg-elevated border border-border hover:border-primary/50
                  rounded-lg md:rounded-xl p-1.5 md:p-3 transition-all duration-200 md:hover:scale-105 hover:shadow-lg hover:shadow-primary/10
                  text-left"
              >
                {/* Logo do canal */}
                <div className="aspect-video rounded-md md:rounded-lg bg-elevated flex items-center justify-center mb-1.5 md:mb-2 overflow-hidden relative">
                  {ch.stream_icon ? (
                    <img
                      src={ch.stream_icon}
                      alt={ch.name}
                      className="w-full h-full object-contain p-1 md:p-2"
                      onError={imgFallback}
                      loading="lazy"
                    />
                  ) : (
                    <Tv size={18} className="text-muted md:w-6 md:h-6" />
                  )}
                  {/* Live badge */}
                  <div className="absolute top-1 left-1 md:top-1.5 md:left-1.5 badge-live flex items-center gap-1 text-[8px] md:text-[10px] px-1.5 py-0.5">
                    <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full live-indicator" />
                    AO VIVO
                  </div>
                </div>

                <p className="text-white text-[10px] md:text-xs font-medium truncate leading-tight">{ch.name}</p>
                {ch.category_name && (
                  <p className="text-muted text-[9px] md:text-[10px] mt-0.5 truncate leading-tight">{ch.category_name}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default LiveTVPage
