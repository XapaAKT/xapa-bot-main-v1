# Guia do XIC BOT: funcionamento e criação de comandos

Este guia descreve o que está implementado neste workspace. Os exemplos de configuração e comandos abaixo não incluem valores de credenciais.

## 1. Visão geral: conexão e despacho

O fluxo principal está em `src/`:

1. **Inicialização — `src/index.js`:** registra tratamento de erros e chama `connect()` para abrir a conexão. Quando recebe o socket, chama `load(socket)`.
2. **Conexão — `src/connection.js`:** cria o socket usando Baileys e carrega o estado de autenticação com `useMultiFileAuthState`. A pasta de sessão é `assets/auth/android/` no Termux e `assets/auth/windows/` nas demais plataformas detectadas pelo código. Se as credenciais ainda não estiverem registradas, solicita um número e mostra um código de pareamento. O arquivo também trata atualizações e tentativas de reconexão.
3. **Eventos — `src/loader.js`:** registra os listeners do socket. Mensagens recebidas (`messages.upsert`) são encaminhadas para o middleware; atualizações de enquetes, chamadas e pedidos para entrar em grupos também têm listeners. Os callbacks são envolvidos por um tratamento de erros.
4. **Processamento — `src/middlewares/onMesssagesUpsert.js`:** processa as mensagens, ignora eventos antigos, aplica verificações como grupo inativo e usuário silenciado, prepara as funções comuns da mensagem, chama o middleware customizável e, por fim, solicita o despacho do comando.
5. **Despacho — `src/utils/dynamicCommand.js`:** procura o comando pelo nome/alias, valida prefixo e contexto, verifica as permissões de acordo com a pasta e chama `command.handle(...)`. Também trata comandos desativados por `disabledReason` e converte erros conhecidos em respostas ao usuário.
6. **Descoberta de comandos — `src/utils/index.js`:** percorre recursivamente os diretórios dentro de `src/commands`, importa arquivos `.js` e `.ts` que não começam com `_` e procura o nome recebido nos aliases do comando.

O listener de mensagens aplica o atraso configurado em `TIMEOUT_IN_MILLISECONDS_BY_EVENT`, atualmente definido em `src/config.js`.

## 2. Estrutura real do projeto

Estrutura resumida das pastas encontradas:

```text
.
├── .skills/
├── assets/
│   ├── audios/
│   ├── auth/
│   ├── auth-backup/
│   ├── auth_old/
│   ├── images/
│   ├── samples/
│   ├── stickers/
│   └── temp/
├── database/
├── docs/
│   └── tutoriais/
├── eggs/
├── logs/
├── src/
│   ├── @types/
│   ├── Comandos antigos/
│   ├── commands/
│   │   ├── admin/
│   │   ├── member/
│   │   │   ├── Economia/
│   │   │   ├── Pokemon/
│   │   │   ├── Utils/
│   │   │   ├── canvas/
│   │   │   ├── downloads/
│   │   │   ├── family/
│   │   │   ├── funny/
│   │   │   ├── game/
│   │   │   ├── ia/
│   │   │   ├── noPrefix/
│   │   │   ├── personalizado/
│   │   │   ├── rpg/
│   │   │   └── search/
│   │   └── owner/
│   │       └── exemplos/
│   ├── data/
│   ├── database/
│   ├── errors/
│   ├── events/
│   ├── middlewares/
│   ├── services/
│   ├── test/
│   └── utils/
│       ├── family/
│       ├── plugins/
│       └── setmenu/
├── videos/
├── AGENTS.md
├── package.json
└── README.md
```

Também existem arquivos diretamente em `src/`, incluindo `index.js`, `connection.js`, `loader.js`, `config.js`, `messages.js`, `msg.js` e `test.js`.

As pastas principais de comandos são:

- `src/commands/member/`: comandos de membros.
- `src/commands/admin/`: comandos administrativos.
- `src/commands/owner/`: comandos do dono e exemplos.

O tipo retornado pelo carregador de comandos é o nome dessa primeira pasta (`member`, `admin` ou `owner`); o despachante usa esse tipo para verificar permissão. Diretórios internos, como `member/Utils/` ou `owner/exemplos/`, organizam os arquivos, mas não substituem a pasta de permissão.

## 3. Anatomia de um comando real

O comando `ddd`, em `src/commands/member/ddd.js`, segue este formato (o objeto `ddds` com os dados consultados foi omitido):

```javascript
import { PREFIX } from "../../config.js";
import { DangerError } from "../../errors/index.js";

// O arquivo também define o objeto ddds, que relaciona DDDs a regiões.

export default {
  name: "ddd",
  description: "Consulta um DDD brasileiro.",
  commands: ["ddd"],
  usage: `${PREFIX}ddd 31`,

  handle: async ({ args, sendReply }) => {
    const ddd = args[0];

    if (!ddd) {
      throw new DangerError(`Use: ${PREFIX}ddd 31`);
    }

    if (!ddds[ddd]) {
      throw new DangerError("DDD não encontrado.");
    }

    await sendReply(
      `📞 *Consulta de DDD*

🔎 DDD: *${ddd}*

📍 Região:
${ddds[ddd]}`
    );
  },
};
```

Os campos solicitados:

- **`name`**: nome identificador do comando (`"ddd"`).
- **`description`**: descrição usada pelo comando e por recursos que exibem informações dos comandos.
- **`commands`**: lista de nomes que o carregador procura para encontrar este módulo. Aqui, o nome invocável é `"ddd"`.
- **`usage`**: texto de uso. O exemplo monta a instrução com o prefixo importado de `config.js`.
- **`handle`**: função assíncrona chamada quando o comando é executado. Recebe os dados e helpers da mensagem; no exemplo, lê o primeiro argumento, valida a entrada e responde.

O comando é exportado como `default`. O diretório `member` determina seu tipo de permissão; não é necessário implementar dentro dele uma checagem manual de cargo.

## 4. Helpers, `WarningError` e `config.js`

### `sendReply`

Helper injetado no objeto recebido por `handle`. Envia texto ao chat e cita/responde à mensagem que acionou o comando. Aceita texto e, opcionalmente, menções e opções de envio. Exemplo:

```javascript
handle: async ({ sendReply }) => {
  await sendReply("Olá!");
}
```

Use os helpers injetados em vez de recriar o envio com chamadas diretas ao socket quando um helper existente atende ao caso.

### `sendSuccessReact`

Helper sem argumentos que reage à mensagem do usuário com ✅:

```javascript
handle: async ({ sendSuccessReact }) => {
  await sendSuccessReact();
}
```

Também existe `sendSuccessReply(text)`, que primeiro usa essa reação e depois envia o texto com `sendReply`.

### `WarningError`

Classe exportada por `src/errors/index.js`. Um comando pode lançá-la quando precisa comunicar um aviso. `src/utils/dynamicCommand.js` captura esse tipo e responde por meio de `sendWarningReply`:

```javascript
import { WarningError } from "../../errors/index.js";

if (!args[0]) {
  throw new WarningError("Informe um valor.");
}
```

`sendWarningReply` também aplica a reação de aviso antes de enviar a resposta. Para erros de parâmetro inválido e erros perigosos, o projeto também exporta `InvalidParameterError` e `DangerError`; o despachante trata cada tipo de forma específica.

### `config.js`

`src/config.js` centraliza configurações importadas pelo restante do código. Entre os valores definidos estão:

- prefixo padrão (`PREFIX`), nome e emoji do bot;
- IDs do bot/dono;
- diretórios (`COMMANDS_DIR`, `DATABASE_DIR`, `ASSETS_DIR` e `TEMP_DIR`);
- atraso de eventos (`TIMEOUT_IN_MILLISECONDS_BY_EVENT`);
- modo de desenvolvimento, filtro opcional de grupo e parâmetros de proxy;
- configurações de serviços externos.

O arquivo tenta carregar `.env` no início, ignorando apenas o caso em que esse arquivo não existe. **Não copie o conteúdo integral de `config.js` para outra IA:** o arquivo contém valores de configuração sensíveis. Compartilhe apenas os nomes e trechos sem credenciais, e nunca inclua tokens, chaves, dados de sessão ou conteúdo de `assets/auth/`.

## 5. Regras para criar um comando

1. Crie um arquivo `.js` dentro de `src/commands/` e escolha a pasta de permissão correta: `member`, `admin` ou `owner`. Subpastas são aceitas.
2. Exporte o comando como `default` e defina `name`, `description`, `commands`, `usage` e `handle`, seguindo os comandos existentes.
3. Coloque os nomes invocáveis em `commands`. O carregador procura esses aliases; não basta escolher um nome para o arquivo.
4. Importe configurações e erros usando caminhos relativos corretos a partir da pasta em que o comando está. Para comandos diretamente em `src/commands/member/`, os imports usuais são `../../config.js` e `../../errors/index.js`.
5. Use os helpers recebidos por `handle` (`sendReply`, `sendSuccessReact`, entre outros) e valide os argumentos antes de usá-los.
6. Para mensagens de aviso, lance `WarningError`; use as classes de erro de `src/errors/` adequadas ao caso para aproveitar o tratamento automático do despachante.
7. Não duplique a checagem de permissão de pasta dentro do comando. O despachante usa o diretório `admin`, `member` ou `owner` para decidir o tipo.
8. Se um comando estiver temporariamente indisponível, a propriedade opcional `disabledReason` é reconhecida pelo despachante e bloqueia sua execução enquanto informa o motivo.
9. Se precisar persistir dados, consulte os módulos de banco de dados existentes. Não leia diretamente arquivos JSON de `database/` dentro de comandos se o acesso já for oferecido por `src/utils/database.js`.
10. Não edite manualmente arquivos de autenticação em `assets/auth/` e nunca coloque credenciais no código de um novo comando.

## 6. Exemplo de comando novo

Salve como `src/commands/member/saudacao.js`. Ele usa o formato de exportação e os helpers existentes; por estar em `member`, fica na categoria de comandos para membros.

```javascript
import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";

export default {
  name: "saudacao",
  description: "Responde com uma saudação personalizada.",
  commands: ["saudacao"],
  usage: `${PREFIX}saudacao <nome>`,

  handle: async ({ args, sendReply, sendSuccessReact }) => {
    const nome = args[0];

    if (!nome) {
      throw new WarningError(`Use: ${PREFIX}saudacao <nome>`);
    }

    await sendReply(`Olá, ${nome}!`);
    await sendSuccessReact();
  },
};
```

Depois que o arquivo estiver salvo na pasta de comandos, o carregador o inclui na busca recursiva. Não é necessário adicionar um `case` a um despachante central.
