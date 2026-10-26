# 7. Boas práticas e checklist

Antes de considerar um comando pronto, confira os itens abaixo.

## Estrutura e permissões

- O arquivo está em `src/commands/member/`, `admin/` ou `owner/` conforme a permissão necessária?
- O módulo exporta `name`, `description`, `commands`, `usage` e `handle`?
- Os caminhos relativos dos imports correspondem à pasta onde o comando está?
- O comando está focado em uma tarefa e usa helpers existentes antes de chamar APIs de baixo nível?

## Entrada e erros

- Os argumentos são validados antes do uso?
- Mensagens de uso mostram uma forma válida de executar o comando?
- O comando usa `InvalidParameterError` para parâmetros incorretos?
- Erros reais não são ignorados nem substituídos por respostas de sucesso?

## Dados e segurança

- Persistência usa funções de `src/utils/database.js` em vez de leitura direta dos JSONs?
- Tokens e credenciais ficam fora do código e não aparecem em logs ou respostas?
- Dados fornecidos por usuários são tratados como entrada não confiável?
- O comando evita ações sensíveis sem verificar o contexto/permissão exigidos?

## Interações

- Cada botão ou linha de lista aponta para um comando existente?
- O ID usa o prefixo da conversa (`prefix || PREFIX`)?
- O comando que recebe a interação valida novamente os argumentos?
- O formato foi testado em um grupo/cliente compatível com a versão atual de Baileys?

## Referências do projeto

- Tipos e helpers de comandos: `src/@types/index.d.ts`.
- Envio de mensagens comuns: `src/utils/loadCommonFunctions.js`.
- Botões e carrosséis: `src/utils/interactive.js`.
- Exemplos prontos: `src/commands/owner/exemplos/`.
- Erros reconhecidos pelo fluxo do bot: `src/errors/`.

Não execute o bot de produção para testar mudanças de documentação. Para validar um novo comando, use o processo de desenvolvimento já adotado no projeto e confira os logs sem expor segredos ou dados de sessão.
