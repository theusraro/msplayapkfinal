import { APP_CONFIG } from '../config/servers.js'

export const shouldUseProxy = () => {
  const proxyUrl = APP_CONFIG.proxyUrl?.trim()
  if (!proxyUrl) return false
  if (typeof window === 'undefined') return false

  // No APK Capacitor, mantemos HTTP direto porque o app nativo ja permite cleartext.
  const isCapacitor = window.Capacitor || window.location.protocol === 'capacitor:'
  if (isCapacitor) return false

  return window.location.protocol === 'https:'
}

export const proxifyUrl = (url) => {
  if (!shouldUseProxy()) return url
  if (!/^https?:\/\//i.test(url)) return url

  const parsed = new URL(url)
  const shouldProxy = parsed.protocol === 'http:' || parsed.hostname === 'alerquina.appm.live'
  if (!shouldProxy) return url

  const proxyBase = APP_CONFIG.proxyUrl.replace(/\/+$/, '')
  return `${proxyBase}/?url=${encodeURIComponent(url)}`
}
