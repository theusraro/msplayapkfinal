# MSPlay HTTPS Proxy

Este proxy existe para o PWA acessar servidores Xtream HTTP a partir de um site HTTPS.

Use apenas com servidores e credenciais autorizados. O proxy aceita somente os hosts listados em `ALLOWED_HOSTS` no arquivo `worker.js`.

Importante: se voce ja criou o Worker, cole novamente o conteudo atualizado de `worker.js` no painel do Cloudflare e clique em `Deploy`.

## Como publicar no Cloudflare Workers

1. Crie uma conta em https://dash.cloudflare.com
2. Abra `Workers & Pages`
3. Clique em `Create`
4. Escolha `Worker`
5. Crie um worker novo
6. Cole o conteudo de `worker.js`
7. Clique em `Deploy`
8. Copie a URL do worker, por exemplo:

```txt
https://msplay-proxy.seuusuario.workers.dev
```

## Como ligar no app

Abra:

```txt
src/config/servers.js
```

Coloque a URL do worker em:

```js
proxyUrl: 'https://msplay-proxy.seuusuario.workers.dev',
```

Depois rode:

```bash
npm run build
```

E publique novamente no GitHub Pages.

## Teste rapido

Troque `USUARIO` e `SENHA` pelos dados reais:

```txt
https://msplay-proxy.seuusuario.workers.dev/?url=http%3A%2F%2Falerquinaz.top%3A80%2Fplayer_api.php%3Fusername%3DUSUARIO%26password%3DSENHA
```

Se retornar JSON com `user_info`, o proxy esta funcionando.

## Importante

Streams de video passam pelo proxy. Isso pode consumir bastante banda e pode ter limite dependendo do plano/servico usado.
