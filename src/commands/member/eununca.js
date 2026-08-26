import { PREFIX } from "../../config.js";
import { getRandomNumber } from "../../utils/index.js";

const frases = [
  "Eu nunca fingi estar ocupado para não responder mensagem.",
  "Eu nunca ri de algo sério sem querer.",
  "Eu nunca esqueci o que ia falar no meio da frase.",
  "Eu nunca mandei mensagem para a pessoa errada.",
  "Eu nunca tentei parecer sério e falhei.",
  "Eu nunca disse 'só mais 5 minutos' e demorei uma hora.",
  "Eu nunca quis dormir e fiquei no celular.",
  "Eu nunca falei que ia fazer algo e deixei pra depois.",
  "Eu nunca dei risada na hora errada.",
  "Eu nunca tive vontade de sumir por uns minutos.",
  "Eu nunca gostei de uma música que eu dizia odiar.",
  "Eu nunca fiquei sem reação numa conversa.",
  "Eu nunca vi uma mensagem e respondi mentalmente.",
  "Eu nunca quis mudar algo em mim do nada.",
  "Eu nunca gostei de um meme e salvei sem admitir.",
];

export default {
  name: "eununca",
  description: "Eu nunca...",
  commands: ["eununca", "eu-nunca"],
  usage: `${PREFIX}eununca`,

  handle: async ({ sendReply, sendSuccessReact }) => {
    const frase = frases[getRandomNumber(0, frases.length - 1)];

    await sendSuccessReact();

    await sendReply(`
╭━━━〔 🥀 EU NUNCA 〕━━━╮

${frase}

╰━━━━━━━━━━━━━━━━━━━━━━╯
`);
  },
};