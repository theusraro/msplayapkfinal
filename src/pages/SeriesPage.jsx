import React, { useState, useMemo, useCallback } from 'react'
import { Search, X, ChevronDown, ChevronRight, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar.jsx'
import CategoryFilter from '../components/CategoryFilter/CategoryFilter.jsx'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner.jsx'
import useXtream from '../hooks/useXtream.js'
import { debounce, imgFallback, truncate } from '../utils/helpers.js'
import useAppStore from '../store/appStore.js'

// Modal de detalhes da série
const SeriesModal = ({ series, onClose }) => {
  const navigate = useNavigate()
  const { currentServer } = useAppStore()
  const { data: info, loading } = useXtream('series_info', { seriesId: series?.series_id })
  const [season, setSeason] = useState(1)

  if (!series) return null

  const seasons = info?.seasons || {}
  const episodes = info?.episodes?.[season] || []

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative bg-surface border border-border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
        <button onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center
            text-white hover:bg-black/80 transition-colors">
          <X size={16} />
        </button>

        {/* Cover */}
        <div className="relative h-48 bg-elevated">
          <img
            src={series.cover || series.backdrop_path}
            alt={series.name}
            className="w-full h-full object-cover"
            onError={imgFallback}
          />
          <div className="absolute inset-0 gradient-bottom" />
        </div>

        <div className="p-5">
          <h2 className="font-bebas text-3xl text-white mb-1">{series.name}</h2>
          {series.plot && <p className="text-muted text-sm leading-relaxed mb-4">{truncate(series.plot, 200)}</p>}

          {loading ? (
            <div className="flex justify-center py-6"><LoadingSpinner /></div>
          ) : (
            <>
              {/* Seletor de temporada */}
              {Object.keys(seasons).length > 0 && (
                <div className="flex gap-2 flex-wrap mb-4">
                  {Object.keys(info?.episodes || {}).map(s => (
                    <button
                      key={s}
                      onClick={() => setSeason(Number(s))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border font-dm
                        ${Number(s) === season ? 'bg-primary border-primary text-white' : 'border-border text-muted hover:text-white'}`}
                    >
                      Temporada {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Episódios */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {episodes.map(ep => (
                  <button
                    key={ep.id}
                    onClick={() => {
                      navigate('/player', { state: { item: ep, type: 'episode', seriesInfo: series } })
                      onClose()
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-elevated hover:bg-white/10
                      transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center flex-shrink-0
                      group-hover:bg-primary transition-colors">
                      <Play size={13} className="text-white ml-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        Ep. {ep.episode_num} — {ep.title || `Episódio ${ep.episode_num}`}
                      </p>
                      {ep.info?.duration && (
                        <p className="text-muted text-xs">{ep.info.duration}</p>
                      )}
                    </div>
                  </button>
                ))}
                {episodes.length === 0 && (
                  <p className="text-muted text-sm text-center py-4">Nenhum episódio disponível</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const SeriesPage = () => {
  const [categoryId, setCategoryId] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const { data: categories } = useXtream('series_categories')
  const { data: allSeries, loading } = useXtream('series', { categoryId })

  const debouncedSearch = useCallback(debounce(setSearch, 300), [])

  const filtered = useMemo(() => {
    if (!allSeries) return []
    if (!search) return allSeries
    const q = search.toLowerCase()
    return allSeries.filter(s => s.name?.toLowerCase().includes(q))
  }, [allSeries, search])

  return (
    <div className="page-container">
      <Navbar />
      <div className="pt-20 px-4 md:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-bebas text-4xl text-white tracking-wide">Séries</h1>
            <p className="text-muted text-sm font-dm mt-0.5">
              {loading ? 'Carregando...' : `${filtered.length} série${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Busca */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            onChange={e => debouncedSearch(e.target.value)}
            placeholder="Buscar séries..."
            className="input-field pl-9"
          />
        </div>

        {/* Categorias */}
        {categories && (
          <div className="mb-6">
            <CategoryFilter categories={categories} selected={categoryId} onSelect={setCategoryId} />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Carregando séries..." />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map(s => (
              <div
                key={s.series_id}
                className="cursor-pointer group"
                onClick={() => setSelected(s)}
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-elevated relative">
                  <img
                    src={s.cover || s.backdrop_path}
                    alt={s.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={imgFallback}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                        <ChevronRight size={20} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-white text-xs font-medium mt-2 truncate">{s.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <SeriesModal series={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

export default SeriesPage
