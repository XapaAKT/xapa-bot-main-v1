import { PREFIX } from "../../../config.js";
import { getUserName } from "../../../utils/index.js";

const prophecies = [
  "Uma mensagem que você está adiando vai continuar lá. Coragem: responda.",
  "Hoje sua sorte está alta — exceto na hora de escolher o que assistir.",
  "Um grande mistério será revelado: alguém vai perguntar “quem tá online?”.",
  "O universo recomenda água, descanso e não mandar áudio de 8 minutos.",
  "Uma oportunidade se aproxima. Pode ser incrível. Pode ser só uma promoção.",
  "Sua próxima ideia vai parecer genial às 2h da manhã. Anote mesmo assim.",
  "Os astros dizem: o grupo vai ficar quieto por 4 minutos. Aproveite.",
];

export default {
  name: "oraculo",
  description: "Consulta as previsões duvidosas do oráculo XIC.",
  commands: ["oraculo", "profecia"],
  usage: `${PREFIX}oraculo`,

  handle: async ({ sendReply, webMessage, userLid }) => {
    const userName = getUserName(webMessage, userLid, "Viajante")
      .replace(/[\r\n]/g, " ")
      .slice(0, 36);
    const prophecy =
      prophecies[Math.floor(Math.random() * prophecies.length)];

    await sendReply(
      `꧁༒︎ 𝕏𝕀ℂ-𝔹𝕆𝕋 ༒︎꧂
╔═══════ 🔮 ═══════╗
    𝐎 𝐎𝐑𝐀́𝐂𝐔𝐋𝐎
╚═══════ 🔮 ═══════╝

☽ 𝐂𝐎𝐍𝐒𝐔𝐋𝐄𝐍𝐓𝐄 :: ${userName}

“${prophecy}”

⛧ Previsão emitida com 0% de
   responsabilidade cósmica.
⌁ Consulte também: ${PREFIX}aura`,
    );
  },
};
