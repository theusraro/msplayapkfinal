import axios from 'axios'
import { FAILOVER_CONFIG } from '../config/servers.js'

// Cria instância axios com timeout configurado
const createClient = (baseURL) =>
  axios.create({ baseURL, timeout: FAILOVER_CONFIG.timeoutMs })

// ── Autenticação ─────────────────────────────────────────────
export const authenticate = async (server) => {
  const { url, username, password } = server
  const client = createClient(url)
  const { data } = await client.get('/player_api.php', {
    params: { username, password },
  })
  if (!data?.user_info || data.user_info.auth === 0) {
    throw new Error('Credenciais inválidas')
  }
  return data
}

// ── Live TV ───────────────────────────────────────────────────
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
  return `${url}/${username}/${password}/${streamId}`
}

// ── VOD (Filmes) ──────────────────────────────────────────────
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
  return `${url}/movie/${username}/${password}/${streamId}.${ext}`
}

// ── Séries ────────────────────────────────────────────────────
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
  return `${url}/series/${username}/${password}/${episodeId}.${ext}`
}

// ── EPG ───────────────────────────────────────────────────────
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

// ── Helper: testa se servidor está online ─────────────────────
export const testServer = async (server) => {
  try {
    await authenticate(server)
    return true
  } catch {
    return false
  }
}
