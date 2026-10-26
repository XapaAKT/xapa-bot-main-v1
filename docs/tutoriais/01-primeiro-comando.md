# 1. Criando seu primeiro comando

Um comando do XIC BOT é um arquivo JavaScript com metadados e uma função `handle`. O carregador encontra o arquivo, reconhece os nomes cadastrados e chama `handle()` quando o comando é usado.

## Passo 1: escolha a pasta

Crie o arquivo na pasta correspondente à permissão:

```text
src/commands/member/saudacao.js
```

Esse exemplo fica em `member`, então será um comando para membros. Não coloque um comando administrativo em `member` esperando que o código o proteja: a pasta é parte do controle de permissão.

## Passo 2: escreva o módulo

```javascript
import { PREFIX } from "../../config.js";

export default {
  name: "saudacao",
  description: "Cumprimenta quem chamou o comando.",
  commands: ["saudacao", "oi-bot"],
  usage: `${PREFIX}saudacao`,

  handle: async ({ sendReply }) => {
    await sendReply("Olá! Comando funcionando.");
  },
};
```

## O que significa cada campo

- `name`: nome principal usado para identificar o comando.
- `description`: resumo curto, usado para documentação e menus.
- `commands`: nomes e aliases que o usuário pode digitar. Cadastre apenas variações que realmente queira suportar.
- `usage`: exemplo de uso exibido quando os parâmetros estão errados.
- `handle`: função assíncrona executada pelo bot.
- `sendReply`: helper injetado pelo projeto que responde à conversa atual citando a mensagem original.
- `await`: espera o envio terminar antes de continuar. Use `await` para chamadas assíncronas.

`PREFIX` vem da configuração do projeto. Não assuma que o prefixo será sempre `!` ou `/`; cada grupo pode ter configuração própria.

## Passo 3: teste o comando

Salve o arquivo, inicie o bot pelo processo normal do projeto e envie o prefixo configurado seguido de `saudacao` (ou `oi-bot`). Confira também a saída do terminal se algo falhar.

## Exemplo com reação

```javascript
handle: async ({ sendReply, sendReact }) => {
  await sendReact("👋");
  await sendReply("Olá!");
},
```

Extraia de `handle()` somente os helpers que usará. Consulte a interface `CommandHandleProps` em `src/@types/index.d.ts` para saber o que está disponível.

## O que evitar

- Não crie um arquivo fora de `src/commands/member`, `admin` ou `owner`.
- Não esqueça o `export default`.
- Não use `fs.readFileSync` diretamente para ler arquivos de `database/`; use `src/utils/database.js`.
- Não faça uma checagem manual de owner/admin dentro do comando quando a pasta já define essa permissão.
- Não copie nomes e caminhos de import de exemplos de outra pasta sem ajustar a quantidade de `../`.
