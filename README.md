# 🎬 MSPlay — Plataforma IPTV

<div align="center">
  <img src="public/assets/logo.svg" alt="MSPlay Logo" width="240" />
  <p><strong>Seu player IPTV moderno com suporte a Xtream Codes, M3U e failover automático</strong></p>
</div>

---

## ✅ Funcionalidades

- 🎬 **Reprodução de Filmes, Séries e TV ao Vivo**
- 🔄 **Failover automático** — troca de servidor sem intervenção
- 📡 **Xtream Codes API** completa
- 📄 **Listas M3U/M3U8** (URL e arquivo local)
- ▶️ **Player HLS** com controles customizados
- 🔍 **Busca e filtros** por categoria
- ⭐ **Favoritos** persistentes
- 🕐 **Histórico** de assistidos com progresso
- 📱 **Responsivo** (mobile, tablet, desktop, Smart TV)
- 🎨 **Design premium** vermelho & preto

---

## 🚀 Instalação e Uso

### 1. Pré-requisitos
- Node.js 18+ instalado ([nodejs.org](https://nodejs.org))
- npm ou yarn

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar servidores IPTV
Edite o arquivo `src/config/servers.js`:

```javascript
export const SERVERS = [
  {
    id: 1,
    type: 'xtream',
    name: 'Meu Servidor',
    url: 'http://meuiptv.com:8080',   // ← seu servidor
    username: 'usuario123',            // ← seu usuário
    password: 'senha456',              // ← sua senha
    port: '80',
    priority: 1,
    active: true,
  },
  // Adicione mais servidores para failover...
]
```

### 4. Rodar em desenvolvimento
```bash
npm run dev
```
Acesse: http://localhost:3000

### 5. Build para produção
```bash
npm run build
```
Os arquivos ficam em `dist/` — pronto para deploy.

---

## 📦 Gerar APK Android

### Opção 1 — Capacitor (Recomendado)
```bash
# 1. Build do projeto
npm run build

# 2. Instalar Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. Inicializar Capacitor
npx cap init MSPlay com.msplay.app --web-dir dist

# 4. Adicionar plataforma Android
npx cap add android

# 5. Sincronizar
npx cap sync android

# 6. Abrir no Android Studio
npx cap open android
# → No Android Studio: Build > Generate Signed APK
```

### Opção 2 — Expo (React Native wrapper)
Converta os componentes para React Native seguindo a doc do Expo.

### Opção 3 — PWA (App Instalável)
O projeto já é uma PWA. No Android, acesse pelo Chrome → "Adicionar à tela inicial".

---

## ⚙️ Sistema de Failover

O failover funciona automaticamente:
1. App tenta o servidor de **prioridade 1**
2. Se falhar (timeout 8s ou erro) → tenta **prioridade 2**, e assim por diante
3. No player: se o stream travar por **15s** → troca servidor automaticamente
4. Toast discreto notifica o usuário da troca

Configure em `src/config/servers.js` → `FAILOVER_CONFIG`.

---

## 📁 Estrutura do Projeto

```
src/
├── components/     Componentes reutilizáveis
├── pages/          Telas do app
├── services/       APIs e lógica de negócio
├── config/         Configurações (servidores, etc.)
├── store/          Estado global (Zustand)
├── hooks/          Custom hooks
└── utils/          Funções auxiliares
```

---

## 🎨 Personalização

- **Cores**: edite as variáveis CSS em `src/index.css`
- **Servidores**: edite `src/config/servers.js`
- **Logo**: substitua `public/assets/logo.svg`
- **Nome do app**: edite `APP_CONFIG.appName` em `servers.js`

---

*MSPlay v1.0.0 — Feito com ❤️ e ☕*
