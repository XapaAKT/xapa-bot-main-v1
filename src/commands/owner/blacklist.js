// blacklist.js
import { getBlacklist, buildBlacklistText } from "../../services/blacklist.js";

export default {
  name: "blacklist",
  description: "Mostra a lista da blacklist.",
  commands: ["blacklist", "banlist", "lista-blacklist"],
  usage: "/blacklist",

  handle: async ({ sendReply, sendErrorReply }) => {
    const reply = sendErrorReply || sendReply;

    try {
      const list = await getBlacklist();
      const text = buildBlacklistText(list);

      return await sendReply(text);
    } catch (error) {
      return await reply(error.message || "Erro ao listar blacklist.");
    }
  },
};