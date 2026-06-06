import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import Navbar from '../components/Navbar/Navbar.jsx'
import ContentCard from '../components/ContentCard/ContentCard.jsx'
import CategoryFilter from '../components/CategoryFilter/CategoryFilter.jsx'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner.jsx'
import useXtream from '../hooks/useXtream.js'
import { debounce } from '../utils/helpers.js'
import { APP_CONFIG } from '../config/servers.js'

const SORT_OPTIONS = [
  { value: 'default', label: 'Mais recentes' },
  { value: 'az', label: 'A-Z' },
  { value: 'rating', label: 'Melhor nota' },
]

const MoviesPage = () => {
  const [categoryId, setCategoryId] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')
  const [visible, setVisible] = useState(APP_CONFIG.infiniteScrollStep)
  const loaderRef = useRef(null)

  const { data: categories, loading: loadCats } = useXtream('vod_categories')
  const { data: allMovies, loading: loadMovies } = useXtream('vod_streams', { categoryId })

  // Busca com debounce
  const debouncedSearch = useCallback(debounce(setSearch, 300), [])

  // Filtro + ordenação
  const filtered = useMemo(() => {
    let items = allMovies || []
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(m => m.name?.toLowerCase().includes(q))
    }
    if (sort === 'az') items = [...items].sort((a, b) => a.name?.localeCompare(b.name))
    if (sort === 'rating') items = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return items
  }, [allMovies, search, sort])

  // Scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisible(v => Math.min(v + APP_CONFIG.infiniteScrollStep, filtered.length))
      }
    }, { threshold: 0.1 })
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [filtered.length])

  useEffect(() => {
    setVisible(APP_CONFIG.infiniteScrollStep)
  }, [categoryId, search, sort])

  const displayed = filtered.slice(0, visible)

  return (
    <div className="page-container">
      <Navbar />
      <div className="pt-20 px-4 md:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-bebas text-4xl text-white tracking-wide">Filmes</h1>
            <p className="text-muted text-sm font-dm mt-0.5">
              {loadMovies ? 'Carregando...' : `${filtered.length} título${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Ordenação */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white
              focus:outline-none focus:border-primary font-dm cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Busca */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            onChange={e => debouncedSearch(e.target.value)}
            placeholder="Buscar filmes..."
            className="input-field pl-9"
          />
        </div>

        {/* Filtro de categorias */}
        {!loadCats && categories && (
          <div className="mb-6">
            <CategoryFilter
              categories={categories}
              selected={categoryId}
              onSelect={setCategoryId}
            />
          </div>
        )}

        {/* Grid */}
        {loadMovies ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Carregando filmes..." />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg">Nenhum filme encontrado</p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-3 text-primary text-sm hover:underline">
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayed.map((movie, i) => (
                <div key={movie.stream_id || i} className="flex justify-center">
                  <ContentCard item={movie} type="movie" ratio="portrait" />
                </div>
              ))}
            </div>

            {/* Loader infinito */}
            {visible < filtered.length && (
              <div ref={loaderRef} className="flex justify-center py-8">
                <LoadingSpinner size="sm" text="Carregando mais..." />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MoviesPage
