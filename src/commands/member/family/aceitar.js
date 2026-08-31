import { acceptPendingProposal } from "../../../services/family.js";
import { familyToMentions } from "../../../services/family.js";

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

      const text = result.type === "marriage"
        ? `╔══════ೋღ💍ღೋ══════╗\n║ 𝐂𝐀𝐒𝐀𝐌𝐄𝐍𝐓𝐎 𝐑𝐄𝐀𝐋𝐈𝐙𝐀𝐃𝐎\n╚══════ೋღ💍ღೋ══════╝\n\n🏠 *${result.family.name}*\n❤️ Parabéns ao novo casal!`
        : `╔══════ೋღ👶ღೋ══════╗\n║ 𝐀𝐃𝐎𝐂̧𝐀̃𝐎 𝐑𝐄𝐀𝐋𝐈𝐙𝐀𝐃𝐀\n╚══════ೋღ👶ღೋ══════╝\n\n🏠 *${result.family.name}*\n👶 A família ganhou um novo filho!`;

      if (sendText) {
        await sendText(text, familyToMentions(result.family));
      } else {
        await sendReply(text);
      }

    } catch (error) {
      return await sendReply(error.message || "Erro ao aceitar pedido.");
    }
  },
};