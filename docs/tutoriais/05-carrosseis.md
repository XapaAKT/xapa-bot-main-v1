# 5. Carrosséis

Este projeto oferece `sendInteractiveCarousel` em `src/utils/interactive.js`. Use esse helper em vez de montar manualmente o protocolo da mensagem.

## Exemplo com imagens e botões

```javascript
import { PREFIX } from "../../config.js";
import {
  sendInteractiveCarousel,
} from "../../utils/interactive.js";

export default {
  name: "galeria",
  description: "Envia um carrossel de opções.",
  commands: ["galeria"],
  usage: `${PREFIX}galeria`,

  handle: async ({ socket, remoteJid, prefix }) => {
    const activePrefix = prefix || PREFIX;

    await sendInteractiveCarousel(
      socket,
      remoteJid,
      {
        text: "Escolha um card:",
        footer: "Deslize para ver as opções",
        cards: [
          {
            title: "Card de imagem",
            imageUrl: "https://exemplo.com/imagem.jpg",
            text: "Veja a primeira opção.",
            footer: "Opção 1",
            buttons: [
              {
                text: "Abrir menu",
                id: `${activePrefix}menu`,
              },
            ],
          },
          {
            title: "Card de texto",
            text: "Este card não precisa de imagem.",
            buttons: [
              {
                text: "Ver ajuda",
                id: `${activePrefix}ajuda`,
              },
            ],
          },
        ],
      },
      { viewOnce: true },
    );
  },
};
```

## Campos de cada card

- `title`: título opcional.
- `imageUrl`: endereço de imagem; também é possível usar `imagePath` para um arquivo local.
- `videoPath`: caminho de vídeo/GIF, quando apropriado.
- `text`: texto do corpo do card. É obrigatório.
- `footer`: rodapé opcional do card.
- `buttons`: respostas rápidas, cada uma com o rótulo `text` e um `id` de comando.
- `nativeFlowButtons`: botões Native Flow já construídos, para casos mais avançados.

O objeto principal aceita `text` e `footer`; o terceiro argumento configura opções, incluindo `viewOnce`, que é `true` por padrão. O helper exige ao menos um card. Valide os arquivos e teste URLs de imagem antes de enviar para usuários.

## O que não fazer

- Não use `caption` como texto do card: o helper espera `text`.
- Não crie cards sem `text`.
- Não coloque IDs de botões que não correspondam a comandos disponíveis.
- Não assuma que qualquer URL ou formato multimídia será aceito por todos os clientes.

Confira `src/commands/owner/test-carousel.js` para mais variações já usadas no projeto.
