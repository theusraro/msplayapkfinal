import React, { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import VideoPlayer from '../components/Player/VideoPlayer.jsx'
import failoverService from '../services/failoverService.js'
import { proxifyUrl } from '../services/proxyUrl.js'
import useAppStore from '../store/appStore.js'

const PlayerPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentServer, addToHistory } = useAppStore()

  const { item, type = 'live' } = location.state || {}

  // Gera lista de URLs com fallback para todos os servidores
  const streamUrls = useMemo(() => {
    if (!item) return []

    const id = item.stream_id || item.episode_id || item.id
    const ext = item.container_extension || 'mp4'

    // Se for M3U direto, tenta proxy no PWA e URL original no APK/WebView.
    if (item.url) {
      const proxiedUrl = proxifyUrl(item.url)
      return [...new Set([proxiedUrl, item.url])]
    }

    // Garante que o failover continue com as credenciais salvas após reabrir o app
    if (currentServer?.username || currentServer?.password) {
      failoverService.setCredentials(currentServer.username, currentServer.password)
    }

    // Gera URLs para todos os servidores Xtream configurados (failover).
    // A própria camada de failover já monta os formatos diretos, /live .ts e .m3u8.
    return failoverService.buildStreamUrls(id, type === 'episode' ? 'series' : type, ext)
  }, [item, type, currentServer])

  if (!item) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">Nenhum conteúdo selecionado</p>
          <button onClick={() => navigate(-1)} className="btn-primary px-6 py-2.5">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const handleBack = () => navigate(-1)

  const handleProgress = (progress) => {
    if (item && progress > 0.01) {
      addToHistory({ ...item, id: item.stream_id || item.series_id || item.id, progress })
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <VideoPlayer
        urls={streamUrls}
        title={item.name || item.title}
        type={type === 'episode' ? 'vod' : type}
        onBack={handleBack}
        onProgress={handleProgress}
      />
    </div>
  )
}

export default PlayerPage
