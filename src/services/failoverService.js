import { SERVERS, FAILOVER_CONFIG, APP_CONFIG } from '../config/servers.js'
import { authenticate } from './xtreamApi.js'
import { validateM3UUrl } from './m3uParser.js'
import { proxifyUrl } from './proxyUrl.js'

const delay = (ms) => new Promise(res => setTimeout(res, ms))

class FailoverService {
  constructor() {
    this.baseServers = SERVERS.filter(s => s.active).sort((a, b) => a.priority - b.priority)
    this.credentials = { username: '', password: '' }
    this.servers = this.withCredentials(this.baseServers)
    this.currentIndex = 0
    this.failLog = []
    this.listeners = []
  }

  // Aplica usuário/senha digitados na tela de login a todos os DNS configurados.
  setCredentials(username = '', password = '') {
    this.credentials = { username, password }
    this.servers = this.withCredentials(this.baseServers)
  }

  withCredentials(servers = []) {
    return servers.map(server => {
      if (server.type === 'm3u') {
        return {
          ...server,
          username: this.credentials.username,
          password: this.credentials.password,
          m3uUrl: `${server.m3uUrl || ''}`
            .replaceAll('{proxy}', APP_CONFIG.proxyUrl.replace(/\/+$/, ''))
            .replaceAll('{username}', encodeURIComponent(this.credentials.username))
            .replaceAll('{password}', encodeURIComponent(this.credentials.password)),
        }
      }

      if (server.type !== 'xtream') return server
      return {
        ...server,
        username: server.username || this.credentials.username,
        password: server.password || this.credentials.password,
        port: server.port || '80',
      }
    })
  }

  // Servidor ativo atual
  getCurrentServer() {
    return this.servers[this.currentIndex] || null
  }

  // Próximo servidor disponível
  getNextServer() {
    if (this.currentIndex + 1 < this.servers.length) {
      this.currentIndex++
      return this.servers[this.currentIndex]
    }
    return null
  }

  // Reseta para o servidor principal
  reset() {
    this.currentIndex = 0
  }

  // Registra falha
  logFailure(server, reason) {
    this.failLog.push({
      serverId: server.id,
      serverName: server.name,
      serverUrl: server.url || server.m3uUrl,
      reason,
      timestamp: new Date().toISOString(),
    })
    console.warn(`[MSPlay Failover] Servidor "${server.name}" falhou: ${reason}`)
  }

  // Tenta autenticar em ordem de prioridade usando o mesmo usuário/senha em todos os DNS.
  async tryLoginSequential(credentials = null) {
    if (credentials?.username || credentials?.password) {
      this.setCredentials(credentials.username, credentials.password)
    }

    this.failLog = []
    const targets = this.servers

    for (let i = 0; i < targets.length; i++) {
      const server = targets[i]

      for (let attempt = 0; attempt < FAILOVER_CONFIG.maxRetries; attempt++) {
        try {
          if (server.type === 'm3u') {
            const valid = await validateM3UUrl(server.m3uUrl)
            if (!valid) throw new Error('Lista M3U invalida')

            this.currentIndex = this.servers.findIndex(s => s.id === server.id)
            return {
              server,
              userInfo: {
                username: this.credentials.username,
                auth: 1,
                status: 'Active',
                message: 'Playlist M3U validada',
              },
              type: 'm3u',
            }
          }

          const data = await authenticate(server)
          this.currentIndex = this.servers.findIndex(s => s.id === server.id)
          return { server, userInfo: data.user_info, type: 'xtream' }
        } catch (err) {
          if (attempt < FAILOVER_CONFIG.maxRetries - 1) {
            await delay(FAILOVER_CONFIG.retryDelayMs)
          } else {
            this.logFailure(server, err.message)
          }
        }
      }
    }

    const details = this.failLog
      .slice(-4)
      .map(item => `${item.serverName}: ${item.reason}`)
      .join(' | ')

    throw new Error(`Todos os DNS falharam. ${details || 'Verifique usuario, senha e conexao.'}`)
  }

  // Constrói URLs com failover para stream.
  // Para TV ao vivo usamos mais de um formato por DNS, porque alguns
  // painéis Xtream entregam em /usuario/senha/id e outros em /live/...
  // Isso evita o erro de "conexão instável" quando o login funciona,
  // mas o formato do link do canal muda entre servidores.
  buildStreamUrls(streamId, type = 'live', ext = 'mp4') {
    const urls = []
    const extensions = [...new Set([ext, 'mp4', 'mkv', 'avi', 'ts'].filter(Boolean))]

    this.servers
      .filter(s => s.type === 'xtream')
      .forEach(server => {
        const base = `${server.url}`.replace(/\/+$/, '')
        const u = encodeURIComponent(server.username || this.credentials.username || '')
        const p = encodeURIComponent(server.password || this.credentials.password || '')

        if (type === 'live') {
          urls.push(`${base}/live/${u}/${p}/${streamId}.m3u8`)
          urls.push(`${base}/live/${u}/${p}/${streamId}.ts`)
          urls.push(`${base}/${u}/${p}/${streamId}.m3u8`)
          urls.push(`${base}/${u}/${p}/${streamId}.ts`)
          urls.push(`${base}/${u}/${p}/${streamId}`)
          return
        }

        if (type === 'movie') {
          extensions.forEach(extension => {
            urls.push(`${base}/movie/${u}/${p}/${streamId}.${extension}`)
          })
          return
        }

        if (type === 'series') {
          extensions.forEach(extension => {
            urls.push(`${base}/series/${u}/${p}/${streamId}.${extension}`)
          })
          return
        }

        urls.push(`${base}/${u}/${p}/${streamId}`)
      })

    return [...new Set(urls)].map(proxifyUrl)
  }

  getLog() {
    return this.failLog
  }
}

// Singleton
export const failoverService = new FailoverService()
export default failoverService
