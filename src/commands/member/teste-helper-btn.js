import { PREFIX } from "../../config.js";
import { sendInteractiveButtons } from "../../utils/interactive.js";

export default {
  name: "teste-helper-btn",
  description: "Teste de botões via baileys_helper",
  commands: ["teste-helper-btn", "btn-helper"],
  usage: `${PREFIX}teste-helper-btn`,

  handle: async ({ socket, remoteJid, sendReply }) => {
    try {
      await sendInteractiveButtons(socket, remoteJid, {
        title: "⛧ Xapa in Chains ⛧",
        text: "Escolha uma opção abaixo:",
        footer: "XIC-BOT",
        buttons: [
          { id: `${PREFIX}mmenu`, text: "👤 Membro" },
          { id: `${PREFIX}amenu`, text: "🛡 Admin" },
          { id: `${PREFIX}omenu`, text: "👑 Dono" },
        ],
      });

      await sendReply("✅ Teste do helper enviado.");
    } catch (error) {
      console.error("[HELPER BTN ERROR]", error);
      await sendReply(`❌ Erro no teste: ${error.message}`);
    }
  },
};