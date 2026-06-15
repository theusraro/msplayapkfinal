import axios from 'axios'
import { FAILOVER_CONFIG } from '../config/servers.js'
import { proxifyUrl } from './proxyUrl.js'

const createClient = (baseURL) =>
  axios.create({ baseURL: proxifyUrl(baseURL), timeout: FAILOVER_CONFIG.timeoutMs })

export const authenticate = async (server) => {
  const { url, username, password } = server
  const { data } = await createClient(url).get('/player_api.php', {
    params: { username, password },
  })

  if (!data?.user_info || data.user_info.auth === 0) {
    throw new Error('Credenciais invalidas')
  }

  return data
}

export const getLiveCategories = async (server) => {
  const { url, username, password } = server
  const { data } = await createClient(url).get('/player_api.php', {
    params: { username, password, action: 'get_live_categories' },
  })
  return data || []
}

export const getLiveStreams = async (server, categoryId = '') => {
  const { url, username, password } = server
  const params = { username, password, action: 'get_live_streams' }
  if (categoryId) params.category_id = categoryId
  const { data } = await createClient(url).get('/player_api.php', { params })
  return data || []
}

export const getLiveStreamUrl = (server, streamId) => {
  const { url, username, password } = server
  return proxifyUrl(`${url}/${username}/${password}/${streamId}`)
}

export const getVodCategories = async (server) => {
  const { url, username, password } = server
  const { data } = await createClient(url).get('/player_api.php', {
    params: { username, password, action: 'get_vod_categories' },
  })
  return data || []
}

export const getVodStreams = async (server, categoryId = '') => {
  const { url, username, password } = server
  const params = { username, password, action: 'get_vod_streams' }
  if (categoryId) params.category_id = categoryId
  const { data } = await createClient(url).get('/player_api.php', { params })
  return data || []
}

export const getVodInfo = async (server, vodId) => {
  const { url, username, password } = server
  const { data } = await createClient(url).get('/player_api.php', {
    params: { username, password, action: 'get_vod_info', vod_id: vodId },
  })
  return data || {}
}

export const getVodStreamUrl = (server, streamId, ext = 'mp4') => {
  const { url, username, password } = server
  return proxifyUrl(`${url}/movie/${username}/${password}/${streamId}.${ext}`)
}

export const getSeriesCategories = async (server) => {
  const { url, username, password } = server
  const { data } = await createClient(url).get('/player_api.php', {
    params: { username, password, action: 'get_series_categories' },
  })
  return data || []
}

export const getSeries = async (server, categoryId = '') => {
  const { url, username, password } = server
  const params = { username, password, action: 'get_series' }
  if (categoryId) params.category_id = categoryId
  const { data } = await createClient(url).get('/player_api.php', { params })
  return data || []
}

export const getSeriesInfo = async (server, seriesId) => {
  const { url, username, password } = server
  const { data } = await createClient(url).get('/player_api.php', {
    params: { username, password, action: 'get_series_info', series_id: seriesId },
  })
  return data || {}
}

export const getEpisodeUrl = (server, episodeId, ext = 'mp4') => {
  const { url, username, password } = server
  return proxifyUrl(`${url}/series/${username}/${password}/${episodeId}.${ext}`)
}

export const getShortEPG = async (server, streamId, limit = 4) => {
  const { url, username, password } = server
  try {
    const { data } = await createClient(url).get('/player_api.php', {
      params: { username, password, action: 'get_short_epg', stream_id: streamId, limit },
    })
    return data?.epg_listings || []
  } catch {
    return []
  }
}

export const testServer = async (server) => {
  try {
    await authenticate(server)
    return true
  } catch {
    return false
  }
}
