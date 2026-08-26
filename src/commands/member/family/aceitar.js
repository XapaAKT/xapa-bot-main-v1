import { acceptPendingProposal } from "../../../services/family.js";
import { toLid } from "../../../utils/family.js";

export default {
  name: "aceitar",
  description: "Aceita um pedido pendente.",
  commands: ["aceitar", "aceitar_"], // aceita com _id também
  usage: "/aceitar [id]",

  handle: async ({ args, userLid, sendReply, sendText, sendSuccessReact }) => {
    try {
      const proposalId = args[0]; // vem do botão:!aceitar_abc123
      const result = await acceptPendingProposal(userLid, proposalId); // passa o id

      if (sendSuccessReact) await sendSuccessReact();

      if (result.type === "marriage") {
        const [a, b] = result.family.spouses;
        const text = `🎉 Casamento realizado!\n\n💍 ${toLid(a)} ❤️ ${toLid(b)}\n🏠 ${result.family.name}`;
        await sendText(text, [toLid(a), toLid(b)].filter(Boolean));
        return;
      }
      //... resto do código de adoção

    } catch (error) {
      return await sendReply(error.message || "Erro ao aceitar pedido.");
    }
  },
};