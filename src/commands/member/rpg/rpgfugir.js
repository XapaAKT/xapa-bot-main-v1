import { flee } from "../../../services/rpgGame.js";
import { getUserName } from "../../../utils/index.js";

export default {
  name: "rpgfugir",
  description: "Foge da batalha atual.",
  commands: ["rpgfugir", "fugir"],
  usage: "/fugir",
  requiresRpg: true,
  handle: async ({ userLid, sendReply, webMessage, sendReact }) => {
    const result = await flee(userLid, getUserName(webMessage, userLid, "Aventureiro"));
    await sendReact("🏃");
    return sendReply(`╔═══〔 🏳️ RETIRADA TÁTICA 〕═══╗
║ ${result}
╚══════════════════════════════╝`);
  },
};
