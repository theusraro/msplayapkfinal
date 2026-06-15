// ============================================================
//  MSPLAY — CONFIGURAÇÃO DE SERVIDORES IPTV COM FAILOVER
//  A tela de login pede somente usuário e senha.
//  O sistema aplica essas credenciais em todos os DNS abaixo
//  e tenta conectar em ordem de prioridade automaticamente.
// ============================================================

export const SERVERS = [
  // ─── DNS XCIPTV ───────────────────────────────────────────
  {
    id: 1,
    type: 'xtream',
    name: 'DNS XCIPTV 1',
    url: 'http://alerquinaz.top:80',
    priority: 1,
    active: true,
  },
  {
    id: 2,
    type: 'xtream',
    name: 'DNS XCIPTV 2',
    url: 'http://newxczs.top:80',
    priority: 2,
    active: true,
  },
  {
    id: 3,
    type: 'xtream',
    name: 'DNS XCIPTV 3',
    url: 'http://p2golld.top:80',
    priority: 3,
    active: true,
  },
  {
    id: 4,
    type: 'xtream',
    name: 'DNS XCIPTV 4',
    url: 'http://zed3.top:80',
    priority: 4,
    active: true,
  },

  // ─── DNS ALTERNATIVA ──────────────────────────────────────
  {
    id: 5,
    type: 'xtream',
    name: 'DNS Alternativa 1',
    url: 'http://alerquinaz.top',
    priority: 5,
    active: true,
  },
  {
    id: 6,
    type: 'xtream',
    name: 'DNS Alternativa 2',
    url: 'http://p2golld.top',
    priority: 6,
    active: true,
  },
  {
    id: 7,
    type: 'xtream',
    name: 'DNS Alternativa 3',
    url: 'http://zed3.top',
    priority: 7,
    active: true,
  },
]

// ─── CONFIGURAÇÕES DO SISTEMA DE FAILOVER ────────────────────
export const FAILOVER_CONFIG = {
  timeoutMs: 8000,       // Tempo (ms) para considerar falha de conexão
  stallTimeoutMs: 1200, // Tempo (ms) de stream travado antes de trocar servidor
  maxRetries: 3,         // Tentativas por servidor antes de trocar
  retryDelayMs: 1200,    // Espera (ms) entre tentativas
  autoSwitch: true,      // Troca automática de servidor
  showNotification: true,// Mostrar toast ao trocar servidor
  autoReconnect: false,  // Tentar reconectar ao servidor principal após falha
}

// ─── CONFIGURAÇÕES GERAIS ─────────────────────────────────────
export const APP_CONFIG = {
  appName: 'MSPlay',
  version: '1.0.0',
  defaultVolume: 0.8,
  cardsPerRow: 6,
  infiniteScrollStep: 20,
  // Coloque aqui a URL do seu Cloudflare Worker quando for usar como PWA.
  // Exemplo: 'https://msplay-proxy.seuusuario.workers.dev'
  proxyUrl: 'https://falling-water-aba0.theusraro.workers.dev',
}
