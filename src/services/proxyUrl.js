import { APP_CONFIG } from '../config/servers.js'

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
  if (!/^http:\/\//i.test(url)) return url

  const proxyBase = APP_CONFIG.proxyUrl.replace(/\/+$/, '')
  if (url.startsWith(proxyBase)) return url
  return `${proxyBase}/?url=${encodeURIComponent(url)}`
}
