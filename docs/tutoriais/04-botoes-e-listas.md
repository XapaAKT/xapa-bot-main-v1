# 4. Botões e listas interativas

Botões e itens de lista precisam indicar o que deve acontecer depois do clique. Neste projeto, a resposta interativa é extraída da mensagem recebida e enviada ao roteador como texto/ID. A forma mais simples é apontar o ID para outro comando com argumento.

## Botões de resposta rápida

Crie um comando, por exemplo `src/commands/member/menu-opcoes.js`:

```javascript
import { PREFIX } from "../../config.js";
import {
  createNativeFlowButton,
  sendNativeFlowButtons,
} from "../../utils/interactive.js";

export default {
  name: "menu-opcoes",
  description: "Mostra opções de resposta rápida.",
  commands: ["menu-opcoes"],
  usage: `${PREFIX}menu-opcoes`,

  handle: async ({ socket, remoteJid, prefix }) => {
    const activePrefix = prefix || PREFIX;

    await sendNativeFlowButtons(socket, remoteJid, {
      title: "Menu de exemplo",
      text: "Escolha uma opção:",
      footer: "Resposta rápida",
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

Significado dos valores:

- `socket` e `remoteJid`: conexão e conversa de destino.
- `sendNativeFlowButtons`: helper do projeto para enviar a mensagem interativa.
- `quick_reply`: tipo de botão de resposta rápida aceito pelo helper.
- `display_text`: texto visível no botão.
- `id`: resposta enviada ao bot no clique. Aqui, ela chama o comando `confirmar` com um argumento.
- `prefix || PREFIX`: usa o prefixo recebido para a conversa e mantém o padrão global como alternativa.

Crie também `src/commands/member/confirmar.js`:

```javascript
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

export default {
  name: "confirmar",
  description: "Processa a escolha do menu.",
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

    throw new InvalidParameterError("Escolha inválida. Use sim ou nao.");
  },
};
```

O fluxo é: clique → o ID do botão chega como resposta → o roteador encontra o comando → o comando processa o argumento.

## Lista de seleção

Uma lista Native Flow usa `single_select`, seções e linhas. Cada `id` de linha deve apontar para um comando que exista:

```javascript
import { PREFIX } from "../../config.js";
import {
  createNativeFlowButton,
  sendNativeFlowButtons,
} from "../../utils/interactive.js";

// Dentro do handle, use:
const activePrefix = prefix || PREFIX;

await sendNativeFlowButtons(socket, remoteJid, {
  text: "Escolha uma categoria:",
  footer: "Lista de opções",
  buttons: [
    createNativeFlowButton("single_select", {
      title: "Abrir categorias",
      sections: [
        {
          title: "Categorias",
          rows: [
            {
              title: "Imagens",
              description: "Comandos de imagem",
              id: `${activePrefix}categoria imagens`,
            },
            {
              title: "Áudio",
              description: "Comandos de áudio",
              id: `${activePrefix}categoria audio`,
            },
          ],
        },
      ],
    }),
  ],
});
```

O exemplo com `// Dentro do handle` mostra apenas o trecho a ser colocado dentro de `handle`; `socket`, `remoteJid` e `prefix` devem ser recebidos nos parâmetros.

## Cuidados

- Use IDs de comando reais, com argumentos válidos.
- Use o prefixo da conversa, não fixe um prefixo literal no botão.
- Mantenha a ação também validada no comando que recebe o clique; não confie que só o botão chamará o comando.
- Teste no WhatsApp usado pelo bot: os formatos interativos dependem da versão instalada e da compatibilidade do cliente.
- Para a implementação com outros tipos de botão, consulte `src/utils/interactive.js` e os exemplos executáveis em `src/commands/owner/exemplos/`.
