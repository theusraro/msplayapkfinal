const getProxyUrl = () => {
  const productionProxy = 'https://falling-water-aba0.theusraro.workers.dev'

  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return 'http://127.0.0.1:8787'
  }

  return productionProxy
}

export const SERVERS = [
  {
    id: 10,
    type: 'm3u',
    name: 'HLS Backend Alerquina',
    m3uUrl: '{proxy}/m3u?username={username}&password={password}&type=hls',
    priority: 1,
    active: true,
  },
  {
    id: 11,
    type: 'm3u',
    name: 'M3U Backend Alerquina',
    m3uUrl: '{proxy}/m3u?username={username}&password={password}&type=m3u',
    priority: 2,
    active: true,
  },
  {
    id: 15,
    type: 'm3u',
    name: 'HLS Curto Alerquina',
    m3uUrl: 'https://alerquina.appm.live/e/{username}/{password}/hls',
    priority: 3,
    active: true,
  },
  {
    id: 16,
    type: 'm3u',
    name: 'M3U Curto Alerquina',
    m3uUrl: 'https://alerquina.appm.live/e/{username}/{password}/m3u',
    priority: 4,
    active: true,
  },
  {
    id: 1,
    type: 'xtream',
    name: 'DNS Smarters',
    url: 'http://esma26.top',
    priority: 10,
    active: false,
  },
  {
    id: 2,
    type: 'xtream',
    name: 'DNS XCIPTV 1',
    url: 'http://alerquinaz.top:80',
    priority: 11,
    active: false,
  },
  {
    id: 3,
    type: 'xtream',
    name: 'DNS XCIPTV 2',
    url: 'http://newxczs.top:80',
    priority: 12,
    active: false,
  },
  {
    id: 4,
    type: 'xtream',
    name: 'DNS XCIPTV 3',
    url: 'http://p2golld.top:80',
    priority: 13,
    active: false,
  },
  {
    id: 5,
    type: 'xtream',
    name: 'DNS XCIPTV 4',
    url: 'http://zed3.top:80',
    priority: 14,
    active: false,
  },
  {
    id: 6,
    type: 'xtream',
    name: 'DNS Alternativa 1',
    url: 'http://alerquinaz.top',
    priority: 15,
    active: false,
  },
  {
    id: 7,
    type: 'xtream',
    name: 'DNS Alternativa 2',
    url: 'http://p2golld.top',
    priority: 16,
    active: false,
  },
  {
    id: 8,
    type: 'xtream',
    name: 'DNS Alternativa 3',
    url: 'http://zed3.top',
    priority: 17,
    active: false,
  },
  {
    id: 9,
    type: 'xtream',
    name: 'DNS Parceiro',
    url: 'http://prbfeliz.top',
    priority: 18,
    active: false,
  },
  {
    id: 12,
    type: 'm3u',
    name: 'M3U Parceiros',
    m3uUrl: 'http://appez.top/get.php?username={username}&password={password}&type=m3u_plus&output=ts',
    priority: 20,
    active: false,
  },
  {
    id: 13,
    type: 'm3u',
    name: 'M3U Alerquina',
    m3uUrl: 'http://alerquinaz.top/get.php?username={username}&password={password}&type=m3u_plus&output=mpegts',
    priority: 21,
    active: false,
  },
  {
    id: 14,
    type: 'm3u',
    name: 'HLS Alerquina',
    m3uUrl: 'http://alerquinaz.top/get.php?username={username}&password={password}&type=m3u_plus&output=m3u8',
    priority: 22,
    active: false,
  },
]

export const FAILOVER_CONFIG = {
  timeoutMs: 6000,
  stallTimeoutMs: 1200,
  maxRetries: 1,
  retryDelayMs: 1000,
  autoSwitch: true,
  showNotification: true,
  autoReconnect: false,
}

export const APP_CONFIG = {
  appName: 'MSPlay',
  version: '1.0.0',
  defaultVolume: 0.8,
  cardsPerRow: 6,
  infiniteScrollStep: 20,
  proxyUrl: getProxyUrl(),
}
