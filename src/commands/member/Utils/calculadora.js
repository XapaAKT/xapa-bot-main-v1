/**
 * Calculadora
 *
 * @author Xapa
 */

function tokenize(expression) {
  const tokens = [];
  let i = 0;

  while (i < expression.length) {
    const char = expression[i];

    // Ignora espaços
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Número decimal
    if (/[0-9.]/.test(char)) {
      let number = "";

      while (i < expression.length && /[0-9.]/.test(expression[i])) {
        number += expression[i];
        i++;
      }

      if ((number.match(/\./g) || []).length > 1) {
        throw new Error(`Número inválido: ${number}`);
      }

      const value = Number(number);

      if (!Number.isFinite(value)) {
        throw new Error(`Número inválido: ${number}`);
      }

      tokens.push({
        type: "number",
        value,
      });

      continue;
    }

    // Operadores
    if ("+-*/%^".includes(char)) {
      tokens.push({
        type: "operator",
        value: char,
      });

      i++;
      continue;
    }

    // Parênteses
    if (char === "(" || char === ")") {
      tokens.push({
        type: "parenthesis",
        value: char,
      });

      i++;
      continue;
    }

    throw new Error(`Caractere inválido: ${char}`);
  }

  return tokens;
}

function precedence(operator) {
  if (operator === "^") return 4;
  if (operator === "*" || operator === "/" || operator === "%") return 3;
  if (operator === "+" || operator === "-") return 2;

  return 0;
}

function isRightAssociative(operator) {
  return operator === "^";
}

function toRPN(tokens) {
  const output = [];
  const operators = [];

  for (const token of tokens) {
    if (token.type === "number") {
      output.push(token);
      continue;
    }

    if (token.type === "parenthesis") {
      if (token.value === "(") {
        operators.push(token);
        continue;
      }

      while (
        operators.length &&
        operators[operators.length - 1].value !== "("
      ) {
        output.push(operators.pop());
      }

      if (!operators.length) {
        throw new Error("Parênteses desbalanceados.");
      }

      operators.pop();
      continue;
    }

    if (token.type === "operator") {
      while (operators.length) {
        const top = operators[operators.length - 1];

        if (top.type !== "operator") {
          break;
        }

        const currentPrecedence = precedence(token.value);
        const topPrecedence = precedence(top.value);

        const shouldPop = isRightAssociative(token.value)
          ? currentPrecedence < topPrecedence
          : currentPrecedence <= topPrecedence;

        if (!shouldPop) {
          break;
        }

        output.push(operators.pop());
      }

      operators.push(token);
    }
  }

  while (operators.length) {
    const operator = operators.pop();

    if (operator.value === "(" || operator.value === ")") {
      throw new Error("Parênteses desbalanceados.");
    }

    output.push(operator);
  }

  return output;
}

function calculateRPN(tokens) {
  const stack = [];

  for (const token of tokens) {
    if (token.type === "number") {
      stack.push(token.value);
      continue;
    }

    if (token.type === "operator") {
      if (stack.length < 2) {
        throw new Error("Expressão matemática incompleta.");
      }

      const right = stack.pop();
      const left = stack.pop();

      let result;

      switch (token.value) {
        case "+":
          result = left + right;
          break;

        case "-":
          result = left - right;
          break;

        case "*":
          result = left * right;
          break;

        case "/":
          if (right === 0) {
            throw new Error("Não é possível dividir por zero.");
          }

          result = left / right;
          break;

        case "%":
          if (right === 0) {
            throw new Error("Não é possível calcular módulo por zero.");
          }

          result = left % right;
          break;

        case "^":
          result = left ** right;
          break;

        default:
          throw new Error(`Operador desconhecido: ${token.value}`);
      }

      if (!Number.isFinite(result)) {
        throw new Error("O resultado é inválido ou infinito.");
      }

      stack.push(result);
    }
  }

  if (stack.length !== 1) {
    throw new Error("Expressão matemática inválida.");
  }

  return stack[0];
}

function calculate(expression) {
  const tokens = tokenize(expression);

  if (!tokens.length) {
    throw new Error("Digite uma expressão matemática.");
  }

  const rpn = toRPN(tokens);

  return calculateRPN(rpn);
}

function formatResult(value) {
  if (Number.isInteger(value)) {
    return value.toLocaleString("pt-BR");
  }

  return value.toLocaleString("pt-BR", {
    maximumFractionDigits: 10,
  });
}

export default {
  name: "calculadora",
  description: "Realiza cálculos matemáticos.",
  commands: ["calculadora", "calc"],
  usage: "/calculadora 10 + 5 * 2",

  handle: async ({
    fullArgs,
    sendReply,
    sendErrorReply,
  }) => {
    const reply = sendErrorReply || sendReply;

    try {
      const expression = String(fullArgs || "").trim();

      if (!expression) {
        return await reply(
          "Digite uma conta.\n\nExemplo:\n/comp 10 + 5 * 2"
        );
      }

      // Limite de segurança
      if (expression.length > 200) {
        return await reply(
          "A expressão é muito grande. Limite máximo: 200 caracteres."
        );
      }

      const result = calculate(expression);

      return await sendReply(
        `🧮 *Calculadora*\n\n📐 Conta: ${expression}\n✅ Resultado: ${formatResult(result)}`
      );
    } catch (error) {
      return await reply(
        `❌ Não consegui calcular.\n\n${error.message}`
      );
    }
  },
};