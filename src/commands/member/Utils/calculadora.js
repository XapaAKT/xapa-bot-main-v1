import { PREFIX } from "../../../config.js";
import { WarningError } from "../../../errors/index.js";
import {
  createNativeFlowButton,
  sendNativeFlowButtons,
} from "../../../utils/interactive.js";

const MAX_EXPRESSION_LENGTH = 200;

function tokenize(expression) {
  const tokens = [];
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];

    if (/\s/.test(char)) {
      index++;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      let number = "";
      let decimalPoints = 0;

      while (index < expression.length && /[0-9.]/.test(expression[index])) {
        if (expression[index] === ".") decimalPoints++;
        number += expression[index++];
      }

      const value = Number(number);
      if (decimalPoints > 1 || !Number.isFinite(value)) {
        throw new Error(`Número inválido: ${number}`);
      }

      tokens.push({ type: "number", value });
      continue;
    }

    if (/[a-z]/i.test(char)) {
      let name = "";
      while (index < expression.length && /[a-z]/i.test(expression[index])) {
        name += expression[index++].toLowerCase();
      }
      tokens.push({ type: "identifier", value: name });
      continue;
    }

    if ("+-*/%^(),".includes(char)) {
      tokens.push({
        type: char === "(" || char === ")" || char === "," ? "symbol" : "operator",
        value: char,
      });
      index++;
      continue;
    }

    throw new Error(`Caractere inválido: ${char}`);
  }

  return tokens;
}

function formatResult(value) {
  if (!Number.isFinite(value)) {
    throw new Error("O resultado é inválido ou infinito.");
  }

  const normalizedValue = Object.is(value, -0) ? 0 : value;
  return normalizedValue.toLocaleString("pt-BR", {
    maximumFractionDigits: 10,
  });
}

function calculate(expression) {
  const tokens = tokenize(expression);
  if (!tokens.length) throw new Error("Digite uma expressão matemática.");

  let position = 0;
  const steps = [];
  const peek = () => tokens[position];
  const consume = (value) => {
    if (peek()?.value !== value) return false;
    position++;
    return true;
  };

  function record(description, value) {
    if (!Number.isFinite(value)) {
      throw new Error("O resultado é inválido ou infinito.");
    }
    steps.push(`${description} = ${formatResult(value)}`);
    return value;
  }

  function applyFunction(name, values) {
    const unaryFunctions = {
      abs: { label: "valor absoluto", run: Math.abs },
      ceil: { label: "arredondamento para cima", run: Math.ceil },
      cos: { label: "cosseno (radianos)", run: Math.cos },
      floor: { label: "arredondamento para baixo", run: Math.floor },
      ln: { label: "logaritmo natural", run: Math.log },
      log: { label: "logaritmo base 10", run: Math.log10 },
      round: { label: "arredondamento", run: Math.round },
      sen: { label: "seno (radianos)", run: Math.sin },
      sin: { label: "seno (radianos)", run: Math.sin },
      sqrt: { label: "raiz quadrada", run: Math.sqrt },
      tan: { label: "tangente (radianos)", run: Math.tan },
    };

    if (name === "raiz") {
      if (values.length !== 2) throw new Error("Use raiz(índice, número).");
      const [degree, value] = values;
      if (degree === 0) throw new Error("O índice da raiz não pode ser zero.");
      if (value < 0 && Number.isInteger(degree) && Math.abs(degree) % 2 === 1) {
        return record(`raiz(${formatResult(degree)}, ${formatResult(value)})`, -((-value) ** (1 / degree)));
      }
      if (value < 0) throw new Error("Raiz de número negativo não é real para esse índice.");
      return record(`raiz(${formatResult(degree)}, ${formatResult(value)})`, value ** (1 / degree));
    }

    if (name === "fat" || name === "fatorial") {
      if (values.length !== 1) throw new Error(`${name} aceita um argumento.`);
      const value = values[0];
      if (!Number.isInteger(value) || value < 0 || value > 170) {
        throw new Error("O fatorial aceita inteiros de 0 a 170.");
      }
      let result = 1;
      for (let factor = 2; factor <= value; factor++) result *= factor;
      return record(`${name}(${formatResult(value)})`, result);
    }

    if (name === "min" || name === "max" || name === "media") {
      if (!values.length) throw new Error(`${name} precisa de pelo menos um argumento.`);
      const result =
        name === "min"
          ? Math.min(...values)
          : name === "max"
            ? Math.max(...values)
            : values.reduce((sum, value) => sum + value, 0) / values.length;
      const label = name === "media" ? "média" : name;
      return record(`${label}(${values.map(formatResult).join(", ")})`, result);
    }

    const definition = unaryFunctions[name];
    if (!definition) throw new Error(`Função desconhecida: ${name}`);
    if (values.length !== 1) throw new Error(`${name} aceita um argumento.`);
    if ((name === "sqrt" || name === "log" || name === "ln") && values[0] <= 0 && name !== "sqrt") {
      throw new Error(`${name} precisa de um número maior que zero.`);
    }
    if (name === "sqrt" && values[0] < 0) {
      throw new Error("Não existe raiz quadrada real de número negativo.");
    }

    return record(`${definition.label} de ${formatResult(values[0])}`, definition.run(values[0]));
  }

  function parseExpression() {
    let value = parseTerm();

    while (peek()?.value === "+" || peek()?.value === "-") {
      const operator = tokens[position++].value;
      const right = parseTerm();
      const left = value;
      value = record(
        `${formatResult(left)} ${operator} ${formatResult(right)}`,
        operator === "+" ? left + right : left - right,
      );
    }

    return value;
  }

  function parseTerm() {
    let value = parseUnary();

    while (["*", "/", "%"].includes(peek()?.value)) {
      const operator = tokens[position++].value;
      const right = parseUnary();
      const left = value;

      if ((operator === "/" || operator === "%") && right === 0) {
        throw new Error(operator === "/" ? "Não é possível dividir por zero." : "Não é possível calcular módulo por zero.");
      }

      const result =
        operator === "*"
          ? left * right
          : operator === "/"
            ? left / right
            : left % right;
      value = record(`${formatResult(left)} ${operator} ${formatResult(right)}`, result);
    }

    return value;
  }

  function parseUnary() {
    if (consume("+")) return parseUnary();

    if (consume("-")) {
      const value = parseUnary();
      return record(`-( ${formatResult(value)} )`, -value);
    }

    return parsePower();
  }

  function parsePower() {
    const base = parsePrimary();

    if (consume("^")) {
      const exponent = parseUnary();
      return record(
        `${formatResult(base)} ^ ${formatResult(exponent)}`,
        base ** exponent,
      );
    }

    return base;
  }

  function parsePrimary() {
    const token = peek();
    if (!token) throw new Error("Expressão matemática incompleta.");

    if (token.type === "number") {
      position++;
      return token.value;
    }

    if (token.type === "identifier") {
      position++;
      const name = token.value;

      if (name === "pi") return Math.PI;
      if (name === "tau") return Math.PI * 2;
      if (name === "e") return Math.E;

      if (!consume("(")) {
        throw new Error(`A função ${name} precisa de parênteses.`);
      }

      const values = [];
      if (!consume(")")) {
        do {
          values.push(parseExpression());
        } while (consume(","));

        if (!consume(")")) throw new Error("Parênteses desbalanceados.");
      }

      return applyFunction(name, values);
    }

    if (consume("(")) {
      const value = parseExpression();
      if (!consume(")")) throw new Error("Parênteses desbalanceados.");
      return value;
    }

    throw new Error("Expressão matemática incompleta.");
  }

  const result = parseExpression();
  if (position !== tokens.length) {
    if (peek()?.value === ")") throw new Error("Parênteses desbalanceados.");
    throw new Error(`Não foi possível interpretar "${peek()?.value}".`);
  }

  return { result, steps };
}

function makeHelp(prefix) {
  return [
    "🧮 *CALCULADORA CIENTÍFICA*",
    "",
    "Digite uma expressão após o comando. A prioridade segue a matemática: parênteses, potências, multiplicação/divisão e soma/subtração.",
    "",
    `📌 Exemplo: ${prefix}calc (10 + 5) * 2`,
    "",
    "➕ Operadores: +, -, *, /, %, ^",
    "📐 Trigonometria (radianos): sen(x), cos(x), tan(x)",
    "√ Raízes: sqrt(x), raiz(índice, x)",
    "📊 Outras funções: abs(x), log(x), ln(x), fat(x), round(x), floor(x), ceil(x)",
    "📈 Listas: min(x, y, ...), max(x, y, ...), media(x, y, ...)",
    "🔣 Constantes: pi, tau, e",
    "",
    "Exemplo de função: sen(pi / 2) + sqrt(81)",
    "Use o botão *📖 Passo a passo* no resultado para ver as operações intermediárias.",
  ].join("\n");
}

function makeResultMessage(expression, result, prefix) {
  const encodedExpression = encodeURIComponent(expression);

  return {
    text: `╭━━━〔 🧮 CALCULADORA 〕━━━╮\n\n  📐 *Expressão:* ${expression}\n  ✅ *Resultado:* ${formatResult(result)}\n\n╰━━━━━━━━━━━━━━━━━━━━━━╯\nToque no botão para ver como cheguei ao resultado.`,
    footer: "ULQUIORRA BOT • Matemática",
    buttons: [
      createNativeFlowButton("quick_reply", {
        display_text: "📖 Passo a passo",
        id: `${prefix}calcpassos ${encodedExpression}`,
      }),
    ],
  };
}

async function showSteps(expression, sendReply) {
  const { result, steps } = calculate(expression);
  const details = steps.length
    ? steps.map((step, index) => `${index + 1}. ${step}`).join("\n")
    : `A expressão já é um valor: ${formatResult(result)}.`;

  await sendReply(
    [
      "📖 *PASSO A PASSO*",
      "",
      `🧾 Expressão: ${expression}`,
      "",
      details,
      "",
      `🎯 *Resultado final: ${formatResult(result)}*`,
    ].join("\n"),
  );
}

export default {
  name: "calculadora",
  description: "Calculadora científica com funções matemáticas e resolução passo a passo.",
  commands: ["calculadora", "calc", "calcpassos"],
  usage: `${PREFIX}calc <expressão>`,

  handle: async ({
    commandName,
    fullArgs,
    prefix,
    remoteJid,
    sendReply,
    sendErrorReply,
    socket,
  }) => {
    const reply = sendErrorReply || sendReply;
    const activePrefix = prefix || PREFIX;
    let expression = String(fullArgs || "").trim();

    if (commandName === "calcpassos") {
      try {
        expression = decodeURIComponent(expression);
      } catch {
        throw new WarningError("Não consegui ler a expressão do botão. Faça a conta novamente.");
      }
    }

    if (!expression) {
      return reply(makeHelp(activePrefix));
    }

    if (expression.length > MAX_EXPRESSION_LENGTH) {
      return reply(`⚠️ A expressão pode ter no máximo ${MAX_EXPRESSION_LENGTH} caracteres.`);
    }

    try {
      if (commandName === "calcpassos") {
        return await showSteps(expression, sendReply);
      }

      const { result } = calculate(expression);
      return await sendNativeFlowButtons(
        socket,
        remoteJid,
        makeResultMessage(expression, result, activePrefix),
      );
    } catch (error) {
      return reply(`❌ *Não consegui calcular.*\n\n${error.message}\n\n${makeHelp(activePrefix)}`);
    }
  },
};
