import { extractTwoTargetJids, shipScore, shipBar } from "../../../utils/family.js";

const frasesPorFaixa = [
  {
    minimo: 0,
    maximo: 20,
    frases: [
      "Isso aí não é casal, é denúncia anônima.",
      "O cupido viu e pediu demissão.",
      "Compatibilidade nível: dividem o grupo e olhe lá.",
    ],
  },
  {
    minimo: 21,
    maximo: 49,
    frases: [
      "Tem química, mas alguém esqueceu de ligar o gás.",
      "Pode virar romance ou só uma amizade com figurinhas.",
      "O coração está carregando... em uma internet bem ruim.",
    ],
  },
  {
    minimo: 50,
    maximo: 79,
    frases: [
      "O casal tem futuro, só falta combinar o rolê.",
      "Já dá para dividir a senha do streaming com cautela.",
      "O cupido está trabalhando, mas sem hora extra.",
    ],
  },
  {
    minimo: 80,
    maximo: 100,
    frases: [
      "Que casalzinho fresco! Já podem escolher a música do casamento.",
      "A química está tão alta que até o grupo ficou romântico.",
      "Amor, carinho e uma vontade suspeita de postar foto combinando.",
    ],
  },
];

function escolherFrase(score) {
  const faixa = frasesPorFaixa.find(({ minimo, maximo }) => score >= minimo && score <= maximo);
  const frases = faixa?.frases || ["O destino ainda está fazendo os cálculos..."];
  return frases[Math.floor(Math.random() * frases.length)];
}

export default {
  name: "ship",
  description: "Calcula compatibilidade entre duas pessoas.",
  commands: ["ship"],
  usage: "/ship @pessoa1 @pessoa2",

  handle: async ({
    args,
    isReply,
    replyLid,
    sendReply,
    sendText,
    sendErrorReply,
  }) => {
    const reply = sendErrorReply || sendReply;
    const [jidA, jidB] = extractTwoTargetJids({ args, isReply, replyLid });

    if (!jidA || !jidB) {
      return await reply("Use assim: /ship @pessoa1 @pessoa2");
    }

    if (jidA === jidB) {
      return await reply("Escolha duas pessoas diferentes.");
    }

    const score = shipScore(jidA, jidB);
    const bar = shipBar(score);

    const text = `╭━━━〔 💘 𝐒𝐇𝐈𝐏 𝐌𝐄𝐓𝐄𝐑 〕━━━╮
│
│ 👤 @${jidA.replace(/\D/g, "")}
│ 💞 @${jidB.replace(/\D/g, "")}
│
│ ❤️ Compatibilidade: ${score}%
│ ${bar}
│
│ 💬 ${escolherFrase(score)}
╰━━━━━━━━━━━━━━━━━━━━━━╯`;

    if (sendText) {
      await sendText(text, [jidA, jidB]);
    } else {
      await sendReply(text);
    }
  },
};