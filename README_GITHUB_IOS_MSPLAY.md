# MSPlay — Projeto pronto para GitHub e preparação iOS

Este pacote foi limpo para subir no GitHub e preparado para gerar iOS com Capacitor.

## O que foi ajustado

- Removidos arquivos pesados que não devem ir para GitHub: `node_modules`, `dist`, `.gradle`, `android/app/build`.
- Adicionado `.gitignore` correto.
- Adicionado `@capacitor/ios` no `package.json`.
- Adicionado `@capacitor/assets` para gerar ícone e splash.
- Adicionados scripts para iOS no `package.json`.
- Criados arquivos de marca:
  - `assets/icon.png` — ícone principal para Android/iOS.
  - `assets/splash.png` — splash para Android/iOS.
  - `public/assets/favicon.png` — ícone do navegador/PWA.
  - `public/assets/app-icon.png` — PNG da logo do app.
- Atualizados os ícones Android em `android/app/src/main/res/mipmap-*`.
- Adicionado `codemagic.yaml` como base para gerar IPA em Mac na nuvem.

## Como subir no GitHub pelo Windows

Abra o terminal dentro da pasta do projeto e rode:

```bash
git init
git add .
git commit -m "Projeto inicial MSPlay preparado para iOS"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/msplay.git
git push -u origin main
```

Antes disso, crie um repositório vazio no GitHub chamado `msplay`.

## Como rodar no Windows para testar web/Android

```bash
npm install
npm run build
npm run dev
```

Para Android:

```bash
npm run cap:sync
cd android
gradlew.bat assembleDebug
```

## Como preparar iOS sem Mac físico

Use Codemagic ou Bitrise. No Codemagic:

1. Suba este projeto no GitHub.
2. Entre no Codemagic.
3. Conecte seu GitHub.
4. Escolha o repositório `msplay`.
5. Use o arquivo `codemagic.yaml`.
6. Configure sua conta Apple Developer/App Store Connect.
7. Rode o workflow `ios-app-store`.
8. Baixe o IPA ou envie para TestFlight.

## Observação importante sobre IPTV

Para App Store, apresente o app como reprodutor de mídia. Não publique o app como fornecedor de canais, filmes ou listas. O app deve deixar claro que não fornece conteúdo e que o usuário deve usar credenciais/listas autorizadas.
