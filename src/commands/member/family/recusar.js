import { PREFIX } from "../../../config.js";
import { rejectPendingProposal } from "../../../services/family.js";

export default {
  name: "recusar",
  description: "Recusa um pedido pendente.",
  commands: ["recusar", "recusar_"], // <- pra pegar do botão
  usage: "/recusar [id]",

  handle: async ({ args, userLid, sendReply, sendSuccessReact, sendErrorReply }) => { // <- COLOQUEI ARGS AQUI
    const reply = sendErrorReply || sendReply;

    try {
      const proposalId = args[0]; // <- pega o id do botão !recusar_abc123
      const proposal = await rejectPendingProposal(userLid, proposalId);

      if (sendSuccessReact) await sendSuccessReact();

      await sendReply(`❌ Pedido recusado com sucesso.\n\nTipo: ${proposal.type}`);
    } catch (error) {
      return await reply(error.message || "Erro ao recusar pedido.");
    }
  },
};