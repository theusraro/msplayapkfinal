const ALLOWED_HOSTS = new Set([
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
const ALLOWED_HOST_SUFFIXES = ['.ofcs.top']

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Range, Content-Type, Accept, Origin, User-Agent',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, Content-Type',
}

function responseText(message, status = 400) {
  return new Response(message, {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function getTargetUrl(request) {
  const requestUrl = new URL(request.url)
  const rawUrl = requestUrl.searchParams.get('url')
  if (!rawUrl) return null

  let target
  try {
    target = new URL(rawUrl)
  } catch {
    return null
  }

  if (target.protocol !== 'http:' && target.protocol !== 'https:') return null
  if (!ALLOWED_HOSTS.has(target.hostname) && !ALLOWED_HOST_SUFFIXES.some(suffix => target.hostname.endsWith(suffix))) {
    return null
  }

  return target
}

function getAlerquinaPlaylistUrl(request) {
  const requestUrl = new URL(request.url)
  const username = requestUrl.searchParams.get('username')?.trim()
  const password = requestUrl.searchParams.get('password')?.trim()
  const type = requestUrl.searchParams.get('type') === 'm3u' ? 'm3u' : 'hls'
  const output = type === 'm3u' ? 'mpegts' : 'm3u8'

  if (!username || !password) return null

  const target = new URL('http://79.127.137.68/get.php')
  target.searchParams.set('username', username)
  target.searchParams.set('password', password)
  target.searchParams.set('type', 'm3u_plus')
  target.searchParams.set('output', output)

  return target
}

async function proxyRequest(request, target) {
  const headers = new Headers()
  const range = request.headers.get('Range')
  const accept = request.headers.get('Accept')
  const userAgent = request.headers.get('User-Agent')

  if (range) headers.set('Range', range)
  if (accept) headers.set('Accept', accept)
  if (userAgent) headers.set('User-Agent', userAgent)

  let upstreamResponse
  try {
    upstreamResponse = await fetch(target.toString(), {
      method: request.method,
      headers,
      redirect: 'follow',
    })
  } catch (error) {
    return responseText(`Upstream fetch failed: ${error.message}`, 502)
  }

  const responseHeaders = new Headers(upstreamResponse.headers)
  Object.entries(CORS_HEADERS).forEach(([key, value]) => responseHeaders.set(key, value))
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('content-length')
  responseHeaders.set('Cache-Control', 'no-store')

  const contentType = upstreamResponse.headers.get('content-type') || ''
  const isPlaylist = /\.m3u8(?:\?|$)/i.test(target.toString()) || contentType.includes('mpegurl')

  if (isPlaylist && request.method !== 'HEAD') {
    const playlist = await upstreamResponse.text()
    const requestUrl = new URL(request.url)
    const rewritten = playlist.split('\n').map(line => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return line

      const absoluteUrl = new URL(trimmed, target).toString()
      if (!/^https?:\/\//i.test(absoluteUrl)) return line

      return `${requestUrl.origin}/?url=${encodeURIComponent(absoluteUrl)}`
    }).join('\n')

    responseHeaders.set('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8')

    return new Response(rewritten, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    })
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  })
}

async function checkPlaylist(request, target) {
  let upstreamResponse
  try {
    upstreamResponse = await fetch(target.toString(), {
      method: 'GET',
      headers: {
        Accept: 'audio/x-mpegurl, application/vnd.apple.mpegurl, text/plain, */*',
      },
      redirect: 'follow',
    })
  } catch (error) {
    return responseText(`Upstream fetch failed: ${error.message}`, 502)
  }

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    return responseText(`Upstream returned ${upstreamResponse.status}`, upstreamResponse.status || 502)
  }

  const reader = upstreamResponse.body.getReader()
  const { value } = await reader.read()
  await reader.cancel()

  const sample = new TextDecoder().decode(value || new Uint8Array())
  const ok = sample.trimStart().startsWith('#EXTM3U')

  return new Response(JSON.stringify({ ok }), {
    status: ok ? 200 : 502,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return responseText('Method not allowed', 405)
    }

    const requestUrl = new URL(request.url)
    const target = requestUrl.pathname === '/m3u' || requestUrl.pathname === '/m3u-check'
      ? getAlerquinaPlaylistUrl(request)
      : getTargetUrl(request)

    if (!target) {
      return responseText('Invalid or blocked target URL', 400)
    }

    if (requestUrl.pathname === '/m3u-check') {
      return checkPlaylist(request, target)
    }

    return proxyRequest(request, target)
  },
}
