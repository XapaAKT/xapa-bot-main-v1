# 6. Enquetes

O helper `sendPoll(title, options, singleChoice)` cria uma enquete na conversa atual. As opções são objetos com a propriedade `optionName`.

## Exemplo de escolha única

```javascript
import { PREFIX } from "../../config.js";

export default {
  name: "votacao",
  description: "Cria uma votação de escolha única.",
  commands: ["votacao"],
  usage: `${PREFIX}votacao`,

  handle: async ({ isGroup, sendPoll, sendReply }) => {
    if (!isGroup) {
      await sendReply("Use este comando em um grupo.");
      return;
    }

    const opcoes = [
      { optionName: "🍕 Pizza" },
      { optionName: "🍣 Sushi" },
      { optionName: "🥗 Salada" },
    ];

    await sendPoll("Qual comida você prefere?", opcoes, true);
  },
};
```

`singleChoice: true` limita a votação a uma opção. Passe `false` para permitir seleção múltipla. `isGroup` é um valor injetado pelo framework; a verificação do exemplo evita enviar a enquete em uma conversa privada.

## Enquete com texto informado pelo usuário

```javascript
handle: async ({ fullArgs, sendPoll, sendReply }) => {
  const pergunta = fullArgs?.trim();

  if (!pergunta) {
    await sendReply("Informe uma pergunta após o comando.");
    return;
  }

  await sendPoll(pergunta, [
    { optionName: "Sim" },
    { optionName: "Não" },
  ], true);
},
```

Esse é apenas o corpo alternativo de `handle`; mantenha os metadados do comando e valide também se o comando deve funcionar em privado ou somente em grupo.

## Cuidados

- Forneça pelo menos duas opções com `optionName`.
- Não misture o texto da pergunta com a lista de opções.
- Não prometa que o bot processará os votos depois: acompanhar votos requer lógica de evento adicional. Veja `src/events/ppp-poll.js` e o comando `src/commands/member/ppp.js` para um exemplo que registra a enquete.
- Consulte `src/commands/owner/exemplos/enviar-enquete.js` para mais um exemplo de uso do helper.
