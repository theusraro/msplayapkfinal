const ALLOWED_HOSTS = new Set([
  'esma26.top',
  'alerquinaz.top',
  'newxczs.top',
  'p2golld.top',
  'zed3.top',
  'prbfeliz.top',
])

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

  if (target.protocol !== 'http:') return null
  if (!ALLOWED_HOSTS.has(target.hostname)) return null

  return target
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return responseText('Method not allowed', 405)
    }

    const target = getTargetUrl(request)
    if (!target) {
      return responseText('Invalid or blocked target URL', 400)
    }

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
    responseHeaders.set('Cache-Control', 'no-store')

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    })
  },
}
