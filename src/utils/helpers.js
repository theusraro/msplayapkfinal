// Formata duração em segundos para HH:MM:SS ou MM:SS
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

// Formata duração em minutos para exibição (ex: "1h 45min")
export const formatDurationMin = (minutes) => {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m}min`
}

// Debounce
export const debounce = (fn, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// Encode base64 simples para armazenamento de credenciais
export const encodeCredentials = (obj) =>
  btoa(unescape(encodeURIComponent(JSON.stringify(obj))))

export const decodeCredentials = (str) => {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(str))))
  } catch {
    return null
  }
}

// Trunca texto
export const truncate = (text, maxLen = 100) => {
  if (!text) return ''
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}

// Retorna placeholder de imagem quando logo não carrega
export const imgFallback = (e) => {
  e.target.onerror = null
  e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23141414' width='300' height='200'/%3E%3Ctext fill='%23B3B3B3' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ESEM IMAGEM%3C/text%3E%3C/svg%3E`
}

// Valida URL
export const isValidUrl = (str) => {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

// Shuffle array (para conteúdo em destaque aleatório)
export const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Rating formatado
export const formatRating = (rating) => {
  if (!rating) return null
  return parseFloat(rating).toFixed(1)
}
