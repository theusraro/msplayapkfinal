import { APP_CONFIG } from '../config/servers.js'

const IPTV_HOSTS = new Set([
  'alerquina.appm.live',
  '79.127.137.68',
  'esma26.top',
  'alerquinaz.top',
  'newxczs.top',
  'p2golld.top',
  'zed3.top',
  'prbfeliz.top',
  'appez.top',
])
const IPTV_HOST_SUFFIXES = ['.ofcs.top']

const isIptvHost = (hostname) => (
  IPTV_HOSTS.has(hostname) || IPTV_HOST_SUFFIXES.some(suffix => hostname.endsWith(suffix))
)

export const shouldUseProxy = () => {
  const proxyUrl = APP_CONFIG.proxyUrl?.trim()
  if (!proxyUrl) return false
  if (typeof window === 'undefined') return false

  // No APK Capacitor, mantemos HTTP direto porque o app nativo ja permite cleartext.
  const isCapacitor = window.Capacitor || window.location.protocol === 'capacitor:'
  if (isCapacitor) return false

  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  return window.location.protocol === 'https:' || isLocalhost
}

export const proxifyUrl = (url) => {
  if (!shouldUseProxy()) return url

  let shouldProxyUrl = false
  try {
    const parsed = new URL(url)
    shouldProxyUrl = parsed.protocol === 'http:' || isIptvHost(parsed.hostname)
  } catch {
    return url
  }

  if (!shouldProxyUrl) return url

  const proxyBase = APP_CONFIG.proxyUrl.replace(/\/+$/, '')
  if (url.startsWith(proxyBase)) return url
  return `${proxyBase}/?url=${encodeURIComponent(url)}`
}
