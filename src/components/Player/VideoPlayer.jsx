import React, { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  RotateCcw, RotateCw, Settings, ChevronLeft, Wifi, WifiOff
} from 'lucide-react'
import { formatDuration } from '../../utils/helpers.js'
import { FAILOVER_CONFIG } from '../../config/servers.js'
import useAppStore from '../../store/appStore.js'

const VideoPlayer = ({ urls = [], title = '', type = 'live', onBack, onProgress }) => {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const controlsTimer = useRef(null)
  const stallTimer = useRef(null)
  const startTimer = useRef(null)
  const urlIndexRef = useRef(0)
  const switchingRef = useRef(false)
  const touchRef = useRef({ startX: 0, startY: 0, startTime: 0 })

  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [buffering, setBuffering] = useState(true)
  const [urlIndex, setUrlIndexState] = useState(0)
  const [error, setError] = useState(null)
  const [networkOk, setNetworkOk] = useState(true)
  const [qualities, setQualities] = useState([])
  const [selectedQuality, setSelectedQuality] = useState(-1)
  const [showQuality, setShowQuality] = useState(false)

  const { addToast, preferences, setPreference, updateProgress } = useAppStore()

  const setUrlIndex = (index) => {
    urlIndexRef.current = index
    setUrlIndexState(index)
  }

  const cleanupCurrentStream = useCallback(() => {
    clearTimeout(stallTimer.current)
    clearTimeout(startTimer.current)

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    const video = videoRef.current
    if (video) {
      video.removeAttribute('src')
      video.load()
    }
  }, [])

  const playVideo = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.volume = volume
    video.muted = muted
    video.play().catch(() => {
      // Em alguns Android/WebView o autoplay é bloqueado até o primeiro toque.
      setPlaying(false)
    })
  }, [volume, muted])

  const tryNextServer = useCallback((reason = 'falha no stream') => {
    if (switchingRef.current) return

    const next = urlIndexRef.current + 1
    if (next < urls.length) {
      switchingRef.current = true
      setNetworkOk(false)

      if (FAILOVER_CONFIG.showNotification) {
        addToast({
          type: 'warning',
          title: 'Ajustando conexão',
          message: `Testando servidor de backup... (${next + 1}/${urls.length})`,
          duration: 2500,
        })
      }

      setUrlIndex(next)
      setTimeout(() => {
        switchingRef.current = false
        loadStream(next)
      }, 150)
      return
    }

    setError('Não foi possível abrir este conteúdo agora. Tente novamente ou escolha outro canal.')
    setBuffering(false)
    setNetworkOk(false)
  }, [urls.length, addToast])

  const loadStream = useCallback((index = 0) => {
    const url = urls[index]
    const video = videoRef.current

    if (!url) {
      setError('Nenhum servidor disponível para este conteúdo.')
      setBuffering(false)
      return
    }

    if (!video) return

    cleanupCurrentStream()
    setUrlIndex(index)
    setBuffering(true)
    setError(null)
    setQualities([])
    setSelectedQuality(-1)

    const isHlsUrl = /\.m3u8(\?|$)/i.test(url)

    startTimer.current = setTimeout(() => {
      if (video.readyState < 2) {
        tryNextServer('tempo limite ao iniciar')
      }
    }, FAILOVER_CONFIG.timeoutMs + 4000)

    if (isHlsUrl && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        manifestLoadingTimeOut: FAILOVER_CONFIG.timeoutMs,
        levelLoadingTimeOut: FAILOVER_CONFIG.timeoutMs,
        fragLoadingTimeOut: FAILOVER_CONFIG.timeoutMs + 4000,
        manifestLoadingMaxRetry: 1,
        levelLoadingMaxRetry: 1,
        fragLoadingMaxRetry: 1,
      })

      hlsRef.current = hls
      hls.loadSource(url)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const qs = data.levels.map((l, i) => ({
          id: i,
          label: l.height ? `${l.height}p` : `Qualidade ${i + 1}`,
        }))
        setQualities(qs)
        setNetworkOk(true)
        clearTimeout(startTimer.current)
        playVideo()
      })

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data?.fatal) tryNextServer(data?.details || 'erro fatal HLS')
      })
      return
    }

    // Links Xtream de TV ao vivo geralmente vêm em TS ou stream direto.
    // No APK/WebView Android o player nativo costuma tocar esses links melhor
    // do que tentar forçar HLS em uma URL que não é .m3u8.
    video.src = url
    video.load()
    playVideo()
  }, [urls, cleanupCurrentStream, playVideo, tryNextServer])

  const resetStallTimer = useCallback(() => {
    clearTimeout(stallTimer.current)
    stallTimer.current = setTimeout(() => {
      tryNextServer('stream travado')
    }, FAILOVER_CONFIG.stallTimeoutMs)
  }, [tryNextServer])

  useEffect(() => {
    const vol = preferences.volume || 0.8
    setVolume(vol)
    setUrlIndex(0)
    loadStream(0)

    return () => {
      cleanupCurrentStream()
    }
  }, [urls.join('|')])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      if (duration > 0 && onProgress) onProgress(video.currentTime / duration)
      if (title) updateProgress(title, video.currentTime / (duration || 1))
    }
    const onDurationChange = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0)
    const onWaiting = () => { setBuffering(true); resetStallTimer() }
    const onStalled = () => { setBuffering(true); resetStallTimer() }
    const onPlaying = () => {
      setBuffering(false)
      setNetworkOk(true)
      clearTimeout(stallTimer.current)
      clearTimeout(startTimer.current)
    }
    const onCanPlay = () => {
      setBuffering(false)
      setNetworkOk(true)
      clearTimeout(startTimer.current)
    }
    const onError = () => tryNextServer('erro do player')
    const onEnded = () => {
      if (type === 'live') tryNextServer('live finalizou')
    }
    const onVolumeChange = () => {
      setVolume(video.volume)
      setMuted(video.muted)
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('durationchange', onDurationChange)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('stalled', onStalled)
    video.addEventListener('playing', onPlaying)
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('error', onError)
    video.addEventListener('ended', onEnded)
    video.addEventListener('volumechange', onVolumeChange)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('durationchange', onDurationChange)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('stalled', onStalled)
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('error', onError)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('volumechange', onVolumeChange)
    }
  }, [duration, resetStallTimer, tryNextServer, onProgress, title, type, updateProgress])

  const showControls = () => {
    setControlsVisible(true)
    clearTimeout(controlsTimer.current)
    controlsTimer.current = setTimeout(() => {
      if (playing) setControlsVisible(false)
    }, 3000)
  }

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    playing ? v.pause() : v.play().catch(() => {})
  }

  const seek = (secs) => {
    const v = videoRef.current
    if (!v || type === 'live') return
    v.currentTime = Math.max(0, Math.min(v.currentTime + secs, duration))
  }

  const handleSeek = (e) => {
    const v = videoRef.current
    if (!v || type === 'live') return
    v.currentTime = (e.target.value / 100) * duration
  }

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value)
    if (videoRef.current) videoRef.current.volume = val
    setPreference('volume', val)
  }

  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !muted
  }

  const toggleFullscreen = () => {
    const el = document.documentElement
    if (!fullscreen) {
      el.requestFullscreen?.()
      screen.orientation?.lock?.('landscape').catch(() => {})
    } else {
      document.exitFullscreen?.()
    }
    setFullscreen(!fullscreen)
  }

  const setQuality = (id) => {
    if (hlsRef.current) hlsRef.current.currentLevel = id
    setSelectedQuality(id)
    setShowQuality(false)
  }

  const handleTouchStart = (e) => {
    const t = e.touches[0]
    touchRef.current = { startX: t.clientX, startY: t.clientY, startTime: Date.now() }
  }

  const handleTouchEnd = (e) => {
    const t = e.changedTouches[0]
    const dx = t.clientX - touchRef.current.startX
    const dy = t.clientY - touchRef.current.startY
    const dt = Date.now() - touchRef.current.startTime
    const isQuick = dt < 300 && Math.abs(dx) < 10 && Math.abs(dy) < 10

    if (isQuick) {
      showControls()
      return
    }

    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 30) {
      const v = videoRef.current
      if (v) v.volume = Math.max(0, Math.min(1, v.volume - dy / 200))
    }
  }

  const handleDoubleTap = (e) => {
    const rect = videoRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    if (x < rect.width / 2) seek(-10)
    else seek(10)
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="relative w-full h-full bg-black select-none"
      onMouseMove={showControls}
      onClick={showControls}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleTap}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
        controls={false}
      />

      {buffering && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-primary animate-spin" />
          <p className="text-white text-sm mt-3 font-dm">
            {urlIndex > 0 ? `Testando servidor ${urlIndex + 1}/${urls.length}...` : 'Carregando...'}
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
          <WifiOff size={40} className="text-red-400 mb-3" />
          <p className="text-white text-center text-sm font-dm max-w-xs px-4">{error}</p>
          <button
            onClick={() => { setUrlIndex(0); loadStream(0) }}
            className="mt-4 btn-primary text-sm px-5 py-2"
          >
            <RotateCcw size={15} /> Tentar novamente
          </button>
        </div>
      )}

      <div className={`absolute inset-0 player-controls-overlay flex flex-col justify-between
        transition-opacity duration-300 z-20 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center justify-between px-4 pt-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center
              text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2 min-w-0 px-2">
            {type === 'live' && (
              <span className="badge-live flex items-center gap-1.5 flex-shrink-0">
                <span className="w-2 h-2 bg-white rounded-full live-indicator" />AO VIVO
              </span>
            )}
            <p className="text-white text-sm font-medium font-dm truncate max-w-[55vw]">{title}</p>
          </div>

          <div className="flex items-center gap-2">
            {!networkOk && <WifiOff size={16} className="text-yellow-400" />}
            {networkOk && urlIndex === 0 && <Wifi size={16} className="text-green-400" />}

            {qualities.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowQuality(!showQuality)}
                  className="p-1.5 text-white/70 hover:text-white transition-colors"
                >
                  <Settings size={18} />
                </button>
                {showQuality && (
                  <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg overflow-hidden shadow-xl min-w-[100px]">
                    <button
                      onClick={() => setQuality(-1)}
                      className={`block w-full px-3 py-2 text-xs text-left hover:bg-elevated transition-colors
                        ${selectedQuality === -1 ? 'text-primary font-semibold' : 'text-white'}`}
                    >Auto</button>
                    {qualities.map(q => (
                      <button
                        key={q.id}
                        onClick={() => setQuality(q.id)}
                        className={`block w-full px-3 py-2 text-xs text-left hover:bg-elevated transition-colors
                          ${selectedQuality === q.id ? 'text-primary font-semibold' : 'text-white'}`}
                      >{q.label}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-8">
          {type !== 'live' && (
            <button onClick={() => seek(-10)} className="text-white/80 hover:text-white transition-colors">
              <RotateCcw size={28} />
            </button>
          )}
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center
              text-white backdrop-blur-sm border border-white/30 transition-all hover:scale-110"
          >
            {buffering
              ? <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              : playing
                ? <Pause size={24} fill="white" />
                : <Play size={24} fill="white" className="ml-1" />
            }
          </button>
          {type !== 'live' && (
            <button onClick={() => seek(10)} className="text-white/80 hover:text-white transition-colors">
              <RotateCw size={28} />
            </button>
          )}
        </div>

        <div className="px-4 pb-4 space-y-2">
          {type !== 'live' && duration > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-xs font-dm min-w-[40px]">{formatDuration(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPct}
                onChange={handleSeek}
                className="progress-bar flex-1"
                style={{
                  background: `linear-gradient(to right, #E50914 ${progressPct}%, rgba(255,255,255,0.2) ${progressPct}%)`
                }}
              />
              <span className="text-white/70 text-xs font-dm min-w-[40px] text-right">{formatDuration(duration)}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="text-white hover:text-white/80 transition-colors">
                {playing ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <div className="flex items-center gap-1.5 group/vol">
                <button onClick={toggleMute} className="text-white hover:text-white/80 transition-colors">
                  {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={handleVolume}
                  className="progress-bar w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-200"
                  style={{
                    background: `linear-gradient(to right, #E50914 ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(muted ? 0 : volume) * 100}%)`
                  }}
                />
              </div>
            </div>

            <button onClick={toggleFullscreen} className="text-white hover:text-white/80 transition-colors">
              {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
