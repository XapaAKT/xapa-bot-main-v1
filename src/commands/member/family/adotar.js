import { PREFIX } from "../../../config.js"; // <- PRECISA DISSO
import { createAdoptionProposal } from "../../../services/family.js";
import { extractTargetJid, toLid } from "../../../utils/family.js";
import { sendInteractiveButtons } from "../../../utils/interactive.js"; // <- IMPORT DO HELPER

export default {
  name: "adotar",
  description: "Envia pedido de adoção.",
  commands: ["adotar"],
  usage: "/adotar @usuario",

  handle: async ({ args, isReply, replyLid, userLid, sendReply, sendText, sendSuccessReact, sendErrorReply, socket, remoteJid }) => { // <- ADICIONEI socket e remoteJid
    const targetJid = extractTargetJid({ args, isReply, replyLid });
    const reply = sendErrorReply || sendReply;

    if (!targetJid) return await reply("Você precisa mencionar ou responder a pessoa que quer adotar.");

    try {
      const proposal = await createAdoptionProposal(userLid, targetJid);
      if (sendSuccessReact) await sendSuccessReact();

      const targetNumber = targetJid.replace(/\D/g, "");
      const proposalId = proposal.id; // <- precisa retornar isso do service

      await sendInteractiveButtons(socket, targetJid, {
        title: "👶 Pedido de Adoção",
        text: `👶 @${userLid.replace(/\D/g, "")} quer te adotar.\n\nVocê aceita ser adotado(a)?`,
        footer: "XIC-BOT Family",
        buttons: [
          { id: `${PREFIX}aceitar ${proposalId}`, text: "✅ Aceitar" },
          { id: `${PREFIX}recusar ${proposalId}`, text: "❌ Recusar" },
        ],
      });

    } catch (error) {
      return await reply(error.message || "Erro ao enviar pedido de adoção.");
    }
  },
};