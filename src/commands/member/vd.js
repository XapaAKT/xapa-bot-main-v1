import { PREFIX } from "../../config.js";
import { getRandomNumber } from "../../utils/index.js";

const truths = [
  "Qual foi a maior vergonha que você já passou?",
  "Qual segredo bobo você nunca contou pra ninguém?",
  "Qual foi a pior cantada que você já recebeu?",
  "Qual hábito estranho você tem?",
  "Quem do grupo você indicaria para um desafio?",
  "Qual foi sua maior mentira já contada?",
  "Qual música você não admite mas gosta?",
  "Qual foi a coisa mais doida que você já fez por impulso?",
  "Qual foi a última vez que você chorou?",
  "Qual foi a maior besteira que você já falou em público?",
];

const dares = [
  "Mande um áudio dizendo que ama o ULQUIORRA BOT.",
  "Escreva um texto elogiando a pessoa do grupo que você mais admira.",
  "Mande uma figurinha aleatória agora.",
  "Fale o nome de 3 pessoas do grupo sem errar.",
  "Digite o nome de alguém do grupo que você considera engraçado.",
  "Mande um emoji que te representa hoje.",
  "Escreva uma frase de 1 linha sobre coragem.",
  "Mande um áudio de 5 segundos falando 'ULQUIORRA BOT'.",
  "Escreva uma mini declaração de amizade.",
  "Faça uma pergunta ousada para o próximo participante.",
];

export default {
  name: "vd",
  description: "Verdade ou desafio",
  commands: ["vd", "verdadeoudesafio", "vdd"],
  usage: `${PREFIX}vd [verdade|desafio]`,

  handle: async ({ args, sendReply, sendSuccessReact }) => {
    const mode = String(args[0] || "").toLowerCase();

    const askTruth = mode === "verdade" || mode === "truth" || mode === "v";
    const askDare = mode === "desafio" || mode === "d";

    const chooseTruth = askTruth ? true : askDare ? false : getRandomNumber(0, 1) === 0;
    const question = chooseTruth
      ? truths[getRandomNumber(0, truths.length - 1)]
      : dares[getRandomNumber(0, dares.length - 1)];

    await sendSuccessReact();

    await sendReply(`
╭━━━〔 ${chooseTruth ? "🗣 VERDADE" : "🔥 DESAFIO"} 〕━━━╮

${question}

╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`);
  },
};