# Tutorial: botões e helpers em outro bot Baileys

Este guia mostra como enviar botões de resposta rápida no WhatsApp e organizar funções reutilizáveis (“helpers”) para usá-las nos comandos. Os exemplos seguem a arquitetura deste projeto, mas os caminhos e o carregador devem ser adaptados ao outro bot.

## 1. Requisitos

- Node.js compatível com a versão de Baileys usada pelo bot.
- Um socket Baileys conectado, com `sendMessage`, `relayMessage` e `user.id`.
- `baileys_helper` instalado.
- A função `sendNativeFlowButtons` deste projeto, em `src/utils/interactive.js`, ou uma implementação equivalente compatível com a versão instalada do Baileys.

Neste projeto, o helper de botões importa o pacote chamado `baileys` e usa `baileys_helper`:

```bash
npm install baileys@7.0.0-rc13 baileys_helper@^1.0.6
```

Se o outro bot já usa uma distribuição ou versão diferente de Baileys, não instale uma segunda implementação sem verificar a compatibilidade. Copie `src/utils/interactive.js` e ajuste os imports/detecção interna do pacote para usar a mesma versão que cria o socket. As APIs internas variam entre versões.

## 2. Por que usar o helper Native Flow

O helper `sendNativeFlowButtons(socket, jid, data)`:

1. monta uma mensagem `interactiveMessage.nativeFlowMessage`;
2. cria o objeto de mensagem Baileys;
3. envia usando `socket.relayMessage`;
4. adiciona os nós de protocolo necessários aos botões.

Por isso, prefira esse helper em vez de passar `interactiveButtons` diretamente para `socket.sendMessage`. Um envio comum do Baileys pode não reconhecer esse formato ou pode entregar uma mensagem sem botão clicável.

O helper também valida o tipo do botão e o JSON dos parâmetros. `createNativeFlowButton` aceita tipos Native Flow como `quick_reply`, `cta_url`, `cta_call`, `cta_copy` e `single_select`.

## 3. Enviar um botão de resposta rápida

No comando que envia a mensagem:

```js
import { PREFIX } from "../../config.js";
import {
  createNativeFlowButton,
  sendNativeFlowButtons,
} from "../../utils/interactive.js";

export default {
  name: "menu-exemplo",
  description: "Envia um menu com botões de resposta rápida.",
  commands: ["menu-exemplo"],
  usage: `${PREFIX}menu-exemplo`,

  handle: async ({ socket, remoteJid, prefix }) => {
    const activePrefix = prefix || PREFIX;

    await sendNativeFlowButtons(socket, remoteJid, {
      title: "Menu de exemplo",
      text: "Escolha uma opção:",
      footer: "Meu bot",
      buttons: [
        createNativeFlowButton("quick_reply", {
          display_text: "✅ Confirmar",
          id: `${activePrefix}confirmar sim`,
        }),
        createNativeFlowButton("quick_reply", {
          display_text: "❌ Cancelar",
          id: `${activePrefix}confirmar nao`,
        }),
      ],
    });
  },
};
```

O `id` precisa executar uma ação real. No exemplo, os botões enviam `/confirmar sim` e `/confirmar nao`. Troque `/` pelo prefixo configurado no bot e use o prefixo do grupo quando houver um prefixo personalizado.

## 4. Receber o clique

No framework deste projeto, cada comando é um módulo em `src/commands/<permissao>/` que exporta `name`, `description`, `commands` e `handle`. O carregador encontra os comandos automaticamente.

Crie, por exemplo, `src/commands/member/confirmar.js`:

```js
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

export default {
  name: "confirmar",
  description: "Processa a escolha feita no menu.",
  commands: ["confirmar"],
  usage: `${PREFIX}confirmar <sim|nao>`,

  handle: async ({ args, sendReply }) => {
    const escolha = args[0]?.toLowerCase();

    if (escolha === "sim") {
      await sendReply("✅ Você confirmou.");
      return;
    }

    if (escolha === "nao") {
      await sendReply("❌ Você cancelou.");
      return;
    }

    throw new InvalidParameterError("Escolha inválida.");
  },
};
```

O fluxo é: clique no botão → WhatsApp devolve o `id` como resposta interativa → o extrator de mensagem obtém esse identificador → o roteador procura o comando e chama `handle`. Em outro bot, confirme que o evento de entrada converte respostas de botão/lista em texto ou encaminha o ID diretamente ao roteador.

Se estiver montando um fluxo pela primeira vez, pode apontar temporariamente os botões para um comando de diagnóstico como `/gatilho confirmar-sim`. Esse comando deve responder com o texto recebido; assim você descobre o formato exato que a sua versão do Baileys entrega antes de conectar a ação final.

## 5. Organizar envio de botões como helper

Quando vários comandos usam os mesmos botões, coloque a lógica comum em um helper. No framework deste projeto, `loadCommonFunctions` já recebe `socket` e `webMessage`, conhece o destino da mensagem (`remoteJid`) e retorna funções como `sendReply`, `sendImageFromBuffer` e `sendAudioFromFile`.

Para disponibilizar uma função de botões aos comandos:

1. Importe os construtores em `src/utils/loadCommonFunctions.js`:

   ```js
   import {
     createNativeFlowButton,
     sendNativeFlowButtons,
   } from "./interactive.js";
   ```

2. Dentro de `loadCommonFunctions({ socket, webMessage })`, após obter `remoteJid`, crie o helper:

   ```js
   const sendQuickReplyButtons = async (text, buttons, footer = "") => {
     const nativeButtons = buttons.map(({ id, text: label }) =>
       createNativeFlowButton("quick_reply", {
         display_text: label,
         id,
       }),
     );

     return sendNativeFlowButtons(socket, remoteJid, {
       text,
       footer,
       buttons: nativeButtons,
     });
   };
   ```

3. Inclua `sendQuickReplyButtons` no objeto retornado por `loadCommonFunctions`:

   ```js
   return {
     // helpers existentes...
     sendQuickReplyButtons,
   };
   ```

4. Use-o no comando:

   ```js
   handle: async ({ sendQuickReplyButtons, prefix }) => {
     const activePrefix = prefix || PREFIX;

     await sendQuickReplyButtons("Quer continuar?", [
       { text: "Sim", id: `${activePrefix}confirmar sim` },
       { text: "Não", id: `${activePrefix}confirmar nao` },
     ]);
   },
   ```

Se o projeto usar TypeScript ou declarações globais, adicione também a assinatura do helper à interface do contexto dos comandos, neste projeto `CommandHandleProps` em `src/@types/index.d.ts`:

```ts
sendQuickReplyButtons(
  text: string,
  buttons: Array<{ id: string; text: string }>,
  footer?: string
): Promise<unknown>;
```

Use o tipo de retorno real do helper/socket do outro bot se ele for conhecido.

## 6. Helpers úteis que o contexto dos comandos pode fornecer

Evite repetir código de baixo nível em cada comando. Injete funções reutilizáveis no contexto, como este projeto faz em `loadCommonFunctions`:

- Mensagens: `sendReply`, `sendText`, `sendSuccessReply`, `sendErrorReply`.
- Reações: `sendReact`, `sendSuccessReact`, `sendErrorReact`.
- Arquivos: `sendImageFromBuffer`, `sendAudioFromFile`, `sendStickerFromFile`.
- Download: `downloadImage`, `downloadAudio`, `downloadVideo`.
- Contexto: `socket`, `remoteJid`, `prefix`, `args`, `fullArgs`, `webMessage`.

Um helper deve encapsular uma tarefa recorrente, receber os dados variáveis como parâmetros e ser adicionado ao objeto retornado pelo carregador. Não coloque lógica que conhece o destino do chat em um utilitário genérico sem passar o `remoteJid` ou o socket explicitamente.

## 7. Botões de URL e listas

Um botão de URL usa `cta_url` e não dispara um comando:

```js
createNativeFlowButton("cta_url", {
  display_text: "Abrir site",
  url: "https://example.com",
});
```

Uma lista Native Flow usa `single_select`:

```js
createNativeFlowButton("single_select", {
  title: "Escolha uma opção",
  sections: [
    {
      title: "Ações",
      rows: [
        {
          title: "Confirmar",
          description: "Confirma a ação",
          id: `${activePrefix}confirmar sim`,
        },
      ],
    },
  ],
});
```

Para listas e CTAs, confira os campos obrigatórios da versão instalada do helper/Baileys. Nem todo tipo de Native Flow é aceito em todos os clientes ou contas WhatsApp.

## 8. Testar e diagnosticar

1. Comece com um único `quick_reply`.
2. Envie-o para uma conversa de teste.
3. Confirme que o botão aparece e que tocar nele envia o comando correto.
4. Teste o prefixo personalizado do grupo e as permissões do comando de destino.
5. Registre os erros do `sendNativeFlowButtons` no log. Não esconda a exceção nem anuncie sucesso antes de o envio terminar.
6. No XIC BOT, use os exemplos `enviar-botoes`, `exemplo-gatilho` e o comando de testes de botões `tb` para conferir os formatos suportados.

Se a mensagem chega sem botão, confira se o código usa `sendNativeFlowButtons` e se o socket tem `relayMessage`. Se o botão aparece, mas o clique não executa nada, confira o `id`, o prefixo, o registro do comando e o tratamento de mensagens interativas recebidas.
