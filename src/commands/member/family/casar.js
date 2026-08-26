import { PREFIX } from "../../../config.js";
import { createMarriageProposal } from "../../../services/family.js";
import { extractTargetJid, toLid } from "../../../utils/family.js";
import { sendInteractiveButtons } from "../../../utils/interactive.js";

export default {
  name: "casar",
  description: "Envia pedido de casamento.",
  commands: ["casar"],
  usage: "/casar @usuario",

  handle: async ({ args, isReply, replyLid, userLid, sendReply, sendText, sendSuccessReact, sendErrorReply, socket, remoteJid }) => {
    const targetJid = extractTargetJid({ args, isReply, replyLid });
    const reply = sendErrorReply || sendReply;

    if (!targetJid) return await reply("Você precisa mencionar ou responder a pessoa que quer casar.");

    try {
      const proposal = await createMarriageProposal(userLid, targetJid);
      if (sendSuccessReact) await sendSuccessReact();

      const targetNumber = targetJid.replace(/\D/g, "");
      const proposalId = proposal.id; // precisa salvar isso no banco

      const text = `╔══════ೋღ💍ღೋ══════╗
⛓️ 𝐏𝐄𝐃𝐈𝐃𝐎 𝐃𝐄 𝐂𝐀𝐒𝐀𝐌𝐄𝐍𝐓𝐎 ⛓️
╚══════ೋღ💍ღೋ══════╝

👤 @${userLid.replace(/\D/g, "")} quer se casar com @${targetNumber}

Você aceita?`;

      await sendInteractiveButtons(socket, targetJid, {
        title: "💍 Pedido de Casamento",
        text: text,
        footer: "XIC-BOT Family",
        buttons: [
          { id: `${PREFIX}aceitar_${proposalId}`, text: "✅ Aceitar" },
          { id: `${PREFIX}recusar_${proposalId}`, text: "❌ Recusar" },
        ],
      });

    } catch (error) {
      return await reply(error.message || "Erro ao criar pedido de casamento.");
    }
  },
};