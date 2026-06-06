import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/xtreamApi.js'
import useAppStore from '../store/appStore.js'

// Cache em memória por sessão
const cache = {}

const useXtream = (action, params = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentServer, addToast } = useAppStore()

  const cacheKey = `${action}_${JSON.stringify(params)}_${currentServer?.id}`

  const fetch = useCallback(async () => {
    if (!currentServer || currentServer.type === 'm3u') {
      setLoading(false)
      return
    }

    if (cache[cacheKey]) {
      setData(cache[cacheKey])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let result
      switch (action) {
        case 'live_categories':
          result = await api.getLiveCategories(currentServer)
          break
        case 'live_streams':
          result = await api.getLiveStreams(currentServer, params.categoryId)
          break
        case 'vod_categories':
          result = await api.getVodCategories(currentServer)
          break
        case 'vod_streams':
          result = await api.getVodStreams(currentServer, params.categoryId)
          break
        case 'vod_info':
          result = await api.getVodInfo(currentServer, params.vodId)
          break
        case 'series_categories':
          result = await api.getSeriesCategories(currentServer)
          break
        case 'series':
          result = await api.getSeries(currentServer, params.categoryId)
          break
        case 'series_info':
          result = await api.getSeriesInfo(currentServer, params.seriesId)
          break
        default:
          throw new Error(`Ação desconhecida: ${action}`)
      }
      cache[cacheKey] = result
      setData(result)
    } catch (err) {
      setError(err.message)
      addToast({ type: 'error', title: 'Erro de conexão', message: err.message })
    } finally {
      setLoading(false)
    }
  }, [action, cacheKey, currentServer])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export default useXtream
