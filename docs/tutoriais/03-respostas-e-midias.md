# 3. Respostas e envio de mídias

Prefira os helpers já injetados pelo framework. Eles conhecem o destinatário atual e mantêm o comportamento padrão de resposta.

## Respostas comuns

```javascript
handle: async ({ sendReply, sendSuccessReply, sendReact }) => {
  await sendReact("⏳");
  await sendReply("Estou processando...");
  await sendSuccessReply("Pronto!");
},
```

Use `sendReply` para texto, `sendSuccessReply` para uma resposta de sucesso e `sendReact` para uma reação. Os helpers podem ser usados sem importar Baileys diretamente.

## Imagem por URL

```javascript
handle: async ({ sendImageFromURL }) => {
  await sendImageFromURL(
    "https://exemplo.com/imagem.jpg",
    "Legenda da imagem",
  );
},
```

Outros helpers de mídia incluem variantes `FromFile` e `FromBuffer`, por exemplo `sendImageFromFile`, `sendAudioFromFile` e `sendVideoFromURL`. Veja as assinaturas e tipos em `src/@types/index.d.ts`. Para arquivos locais do projeto, use caminhos construídos a partir de `ASSETS_DIR` em vez de depender do diretório atual do processo.

## Quando usar o socket

Para recursos que não têm um helper injetado, o comando pode usar `socket.sendMessage`. Isso é uma API de nível mais baixo: o comando precisa informar explicitamente o destino (`remoteJid`) e o formato exigido pelo Baileys.

```javascript
handle: async ({ socket, remoteJid }) => {
  await socket.sendMessage(remoteJid, {
    text: "Mensagem enviada com a API do socket.",
  });
},
```

Use a API avançada apenas quando os helpers existentes não atenderem ao caso. Trate erros de envio no fluxo do bot, sem considerar uma falha como sucesso.

## Não faça

- Não leia arquivos de `database/` com `fs` dentro dos comandos; use as funções exportadas por `src/utils/database.js`.
- Não coloque chave de API, senha ou token no código, na mensagem de erro ou em logs.
- Não passe um caminho de arquivo presumido: use o caminho correto do projeto e confirme que o arquivo existe.
