import axios from 'axios'

// Faz parse de uma string M3U e retorna lista de canais/conteúdos
export const parseM3UString = (content) => {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean)
  const items = []
  let current = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('#EXTINF')) {
      // Extrai duração e atributos da linha EXTINF
      const durationMatch = line.match(/#EXTINF:([-\d.]+)/)
      const duration = durationMatch ? parseFloat(durationMatch[1]) : -1

      // Extrai atributos chave="valor"
      const attrs = {}
      const attrRegex = /([\w-]+)="([^"]*)"/g
      let match
      while ((match = attrRegex.exec(line)) !== null) {
        attrs[match[1]] = match[2]
      }

      // Extrai nome (após a última vírgula)
      const nameMatch = line.match(/,(.+)$/)
      const name = nameMatch ? nameMatch[1].trim() : 'Sem Nome'

      current = {
        name: attrs['tvg-name'] || name,
        tvgId: attrs['tvg-id'] || '',
        tvgLogo: attrs['tvg-logo'] || '',
        group: attrs['group-title'] || 'Geral',
        duration,
      }
    } else if (line.startsWith('http') || line.startsWith('rtmp')) {
      if (current) {
        const id = `m3u_${items.length}`
        const extMatch = line.match(/\.([a-z0-9]+)(?:\?|$)/i)
        items.push({
          ...current,
          url: line,
          id,
          stream_id: id,
          stream_icon: current.tvgLogo,
          category_name: current.group,
          container_extension: extMatch?.[1] || 'm3u8',
        })
        current = null
      }
    }
  }

  return items
}

// Agrupa itens por categoria/grupo
export const groupByCategory = (items) => {
  return items.reduce((acc, item) => {
    const group = item.group || 'Geral'
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {})
}

// Busca e faz parse de uma URL M3U remota
export const fetchAndParseM3U = async (url) => {
  const response = await axios.get(url, {
    timeout: 15000,
    responseType: 'text',
    headers: { 'User-Agent': 'MSPlay/1.0' },
  })
  return parseM3UString(response.data)
}

// Parse de arquivo M3U local (File object do input)
export const parseM3UFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const items = parseM3UString(e.target.result)
        resolve(items)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
    reader.readAsText(file)
  })
}

// Detecta tipo de conteúdo pela URL ou grupo
export const detectContentType = (item) => {
  const group = (item.group || '').toLowerCase()
  const name = (item.name || '').toLowerCase()
  const url = (item.url || '').toLowerCase()

  if (url.includes('/movie/') || group.includes('filme') || group.includes('vod')) {
    return 'movie'
  }
  if (url.includes('/series/') || group.includes('serie') || group.includes('série')) {
    return 'series'
  }
  return 'live'
}
