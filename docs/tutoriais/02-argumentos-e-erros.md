# 2. Argumentos, validação e erros

Os valores digitados depois do nome do comando são disponibilizados por `handle()`. Escolha a forma de leitura de acordo com o formato que o comando espera.

## Usando `args` para opções separadas

```javascript
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

export default {
  name: "somar",
  description: "Soma dois números.",
  commands: ["somar"],
  usage: `${PREFIX}somar <numero1> <numero2>`,

  handle: async ({ args, sendReply }) => {
    const primeiro = Number(args[0]);
    const segundo = Number(args[1]);

    if (
      args.length < 2 ||
      !Number.isFinite(primeiro) ||
      !Number.isFinite(segundo)
    ) {
      throw new InvalidParameterError(
        `Use assim: ${PREFIX}somar 2 3`,
      );
    }

    await sendReply(`Resultado: ${primeiro + segundo}`);
  },
};
```

`args` é um array de strings. Verifique se o item existe e converta/valide o tipo antes de usá-lo. `Number.isFinite` evita aceitar valores como `NaN` e infinito como números válidos.

## Usando `fullArgs` para texto livre

Para uma frase ou nome que pode conter espaços, use `fullArgs`:

```javascript
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

export default {
  name: "repetir",
  description: "Repete um texto.",
  commands: ["repetir"],
  usage: `${PREFIX}repetir <texto>`,

  handle: async ({ fullArgs, sendReply }) => {
    const texto = fullArgs?.trim();

    if (!texto) {
      throw new InvalidParameterError(
        `Informe um texto. Exemplo: ${PREFIX}repetir Olá, mundo!`,
      );
    }

    await sendReply(texto);
  },
};
```

`args` é adequado para palavras/opções individuais. `fullArgs` preserva o conjunto de argumentos como uma string. No projeto, `args` também pode ser separado por `/`, `|` ou `\\`; não use esses caracteres como separadores se eles precisarem fazer parte literal de um argumento.

## Erros previstos

Use `InvalidParameterError` para entrada ausente ou inválida. O fluxo do bot já conhece os erros definidos em `src/errors/` e apresenta uma resposta apropriada.

Não esconda falhas com `catch` vazio ou com uma mensagem de sucesso. Se precisar tratar uma exceção, registre ou informe o erro de forma clara e preserve a falha real.
