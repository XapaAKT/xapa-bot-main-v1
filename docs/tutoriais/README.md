# Tutoriais para criar comandos

Este guia ensina, do zero, como criar comandos para o XIC BOT. Os exemplos seguem a estrutura real do projeto e usam os helpers disponíveis em `handle()`.

## Roteiro recomendado

1. [Criando seu primeiro comando](./01-primeiro-comando.md)
2. [Argumentos, validação e erros](./02-argumentos-e-erros.md)
3. [Respostas e envio de mídias](./03-respostas-e-midias.md)
4. [Botões e listas interativas](./04-botoes-e-listas.md)
5. [Carrosséis](./05-carrosseis.md)
6. [Enquetes](./06-enquetes.md)
7. [Boas práticas e checklist](./07-boas-praticas.md)

## Onde criar o arquivo

Comandos são módulos `.js` colocados em uma destas pastas:

- `src/commands/member/`: comandos disponíveis para membros.
- `src/commands/admin/`: comandos de administração de grupos.
- `src/commands/owner/`: comandos restritos ao dono do bot.

Escolha a pasta conforme a permissão necessária. O sistema carrega os comandos a partir dessas pastas; arquivos Markdown desta documentação não são comandos.

## Antes de começar

- Use Node.js e a sintaxe de módulos já adotada no projeto (`import` e `export default`).
- Copie o padrão de um comando existente e confira os helpers em `src/@types/index.d.ts`.
- Botões, listas e carrosséis usam utilitários do projeto e podem depender da versão de Baileys instalada. Prefira os exemplos desta documentação e teste no ambiente do bot.
- Não compartilhe nem coloque tokens, credenciais ou arquivos de sessão em exemplos ou no Git.

## Exemplos existentes no projeto

Há outros exemplos executáveis em `src/commands/owner/exemplos/`, além dos utilitários em `src/utils/interactive.js`. Os comandos dessa pasta executável são restritos ao owner; use-os para consultar a implementação, não como autorização para qualquer usuário.
