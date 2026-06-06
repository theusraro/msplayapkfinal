import React, { useMemo } from 'react'
import Navbar from '../components/Navbar/Navbar.jsx'
import HeroBanner from '../components/HeroBanner/HeroBanner.jsx'
import ContentRow from '../components/ContentRow/ContentRow.jsx'
import useXtream from '../hooks/useXtream.js'
import useAppStore from '../store/appStore.js'
import { shuffle } from '../utils/helpers.js'

const HomePage = () => {
  const { favorites, watchHistory } = useAppStore()

  const { data: movies, loading: loadMovies } = useXtream('vod_streams')
  const { data: series, loading: loadSeries } = useXtream('series')
  const { data: live, loading: loadLive } = useXtream('live_streams')

  // Hero: mistura de filmes e séries com backdrop
  const heroItems = useMemo(() => {
    const all = [
      ...(movies || []).filter(m => m.backdrop_path || m.cover).slice(0, 15),
      ...(series || []).filter(s => s.cover || s.backdrop_path).slice(0, 10),
    ]
    return shuffle(all).slice(0, 8)
  }, [movies, series])

  // Em alta: primeiros 20 de cada
  const trending = useMemo(() => {
    return shuffle([
      ...(movies || []).slice(0, 10),
      ...(series || []).slice(0, 10),
    ]).slice(0, 20)
  }, [movies, series])

  // Continue assistindo
  const continueWatching = watchHistory.slice(0, 12)

  // Favoritos combinados
  const allFavs = [
    ...(favorites.movies || []),
    ...(favorites.series || []),
    ...(favorites.channels || []),
  ]

  return (
    <div className="page-container">
      <Navbar />

      {/* Hero Banner */}
      <HeroBanner items={heroItems} type="movie" />

      <div className="pb-12">
        {/* Continue assistindo */}
        {continueWatching.length > 0 && (
          <ContentRow
            title="🕐 Continue Assistindo"
            items={continueWatching}
            type="movie"
          />
        )}

        {/* Em alta */}
        <ContentRow
          title="🔥 Em Alta"
          items={trending}
          type="movie"
          loading={loadMovies && loadSeries}
        />

        {/* Filmes em destaque */}
        <ContentRow
          title="🎬 Filmes em Destaque"
          items={(movies || []).slice(0, 20)}
          type="movie"
          ratio="portrait"
          loading={loadMovies}
        />

        {/* Séries populares */}
        <ContentRow
          title="📺 Séries Populares"
          items={(series || []).slice(0, 20)}
          type="series"
          ratio="portrait"
          loading={loadSeries}
        />

        {/* TV ao Vivo */}
        <ContentRow
          title="📡 TV ao Vivo Agora"
          items={(live || []).slice(0, 20)}
          type="live"
          loading={loadLive}
        />

        {/* Favoritos */}
        {allFavs.length > 0 && (
          <ContentRow
            title="⭐ Meus Favoritos"
            items={allFavs.slice(0, 20)}
            type="movie"
          />
        )}
      </div>
    </div>
  )
}

export default HomePage
