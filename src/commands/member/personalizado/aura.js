import { PREFIX } from "../../../config.js";
import { getUserName } from "../../../utils/index.js";

const auras = [
  {
    title: "𝑺𝑶𝑩𝑬𝑹𝑨𝑵𝑶 𝑫𝑶 𝑪𝑨𝑶𝑺",
    detail: "transforma qualquer plano simples em uma história lendária.",
    color: "🩸",
  },
  {
    title: "𝑭𝑨𝑵𝑻𝑨𝑺𝑴𝑨 𝑫𝑶 𝑮𝑹𝑼𝑷𝑶",
    detail: "aparece, manda uma mensagem enigmática e some por 3 horas.",
    color: "👻",
  },
  {
    title: "𝑳𝑬𝑵𝑫𝑨 𝑫𝑶 𝑹𝑶𝑳𝑬",
    detail: "tem 1% de bateria, mas ainda carrega a energia do rolê.",
    color: "⚡",
  },
  {
    title: "𝑴𝑬𝑺𝑻𝑹𝑬 𝑫𝑶 𝑫𝑹𝑨𝑴𝑨",
    detail: "recebeu uma notificação e já imaginou 12 temporadas.",
    color: "🎭",
  },
  {
    title: "𝑮𝑼𝑨𝑹𝑫𝑰𝑨̃𝑶 𝑫𝑶 𝑪𝑨𝑶𝑺",
    detail: "não começa a confusão — só chega quando ela fica interessante.",
    color: "⛓️",
  },
];

export default {
  name: "aura",
  description: "Revela a aura lendária de quem chamou o bot.",
  commands: ["aura", "minhaaura"],
  usage: `${PREFIX}aura`,

  handle: async ({ sendReply, webMessage, userLid }) => {
    const userName = getUserName(webMessage, userLid, "Viajante")
      .replace(/[\r\n]/g, " ")
      .slice(0, 36);
    const aura = auras[Math.floor(Math.random() * auras.length)];

    await sendReply(
      `꧁༒︎ 𝕏𝕀ℂ-𝔹𝕆𝕋 ༒︎꧂
╔═══════ ⛧ ═══════╗
   𝐋𝐄𝐈𝐓𝐔𝐑𝐀 𝐃𝐄 𝐀𝐔𝐑𝐀
╚═══════ ⛧ ═══════╝

${aura.color} 𝐀𝐋𝐕𝐎 :: ${userName}
⛓️ 𝐂𝐋𝐀𝐒𝐒𝐄 :: ${aura.title}

╭───────────────╮
┃ ${aura.detail}
╰───────────────╯

⌁ O destino foi consultado.
   Reclamações: ${PREFIX}oraculo`,
    );
  },
};
