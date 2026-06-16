import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/xtreamApi.js'
import { fetchAndParseM3U, detectContentType } from '../services/m3uParser.js'
import useAppStore from '../store/appStore.js'

const cache = {}
const m3uCache = {}

const getM3UItems = async (server) => {
  if (!server?.m3uUrl) return []
  if (!m3uCache[server.m3uUrl]) {
    m3uCache[server.m3uUrl] = await fetchAndParseM3U(server.m3uUrl)
  }
  return m3uCache[server.m3uUrl]
}

const filterM3UItems = (items, contentType, categoryId = '') => {
  return items
    .filter(item => detectContentType(item) === contentType)
    .filter(item => !categoryId || item.category_name === categoryId || item.group === categoryId)
}

const toCategories = (items) => {
  const groups = [...new Set(items.map(item => item.category_name || item.group || 'Geral'))]
  return groups.map(group => ({ category_id: group, category_name: group }))
}

const useXtream = (action, params = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentServer, addToast } = useAppStore()

  const cacheKey = [
    action,
    JSON.stringify(params),
    currentServer?.id,
    currentServer?.type,
    currentServer?.username,
    currentServer?.m3uUrl,
  ].join('_')

  const fetch = useCallback(async () => {
    if (!currentServer) {
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

      if (currentServer.type === 'm3u') {
        const items = await getM3UItems(currentServer)

        switch (action) {
          case 'live_categories':
            result = toCategories(filterM3UItems(items, 'live'))
            break
          case 'live_streams':
            result = filterM3UItems(items, 'live', params.categoryId)
            break
          case 'vod_categories':
            result = toCategories(filterM3UItems(items, 'movie'))
            break
          case 'vod_streams':
            result = filterM3UItems(items, 'movie', params.categoryId)
            break
          case 'vod_info':
            result = {}
            break
          case 'series_categories':
            result = toCategories(filterM3UItems(items, 'series'))
            break
          case 'series':
            result = filterM3UItems(items, 'series', params.categoryId).map(item => ({
              ...item,
              series_id: item.id,
              cover: item.stream_icon,
            }))
            break
          case 'series_info':
            result = {}
            break
          default:
            throw new Error(`Acao desconhecida: ${action}`)
        }
      } else {
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
            throw new Error(`Acao desconhecida: ${action}`)
        }
      }

      cache[cacheKey] = result
      setData(result)
    } catch (err) {
      setError(err.message)
      addToast({ type: 'error', title: 'Erro de conexao', message: err.message })
    } finally {
      setLoading(false)
    }
  }, [action, cacheKey, currentServer, params.categoryId, params.seriesId, params.vodId, addToast])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export default useXtream
