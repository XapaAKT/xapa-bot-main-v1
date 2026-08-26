// addblacklist.js
import { addToBlacklist } from "../../services/blacklist.js";

function extractTarget({ args = [], isReply = false, replyLid = null } = {}) {
  if (isReply && replyLid) return replyLid;
  if (!args.length) return null;
  return args[0];
}

export default {
  name: "addblacklist",
  description: "Adiciona um número ou @ na blacklist.",
  commands: ["addblacklist", "blacklistadd", "blacklist-add"],
  usage: "/addblacklist @usuario ou /addblacklist 5531999999999",

  handle: async ({
    args,
    isReply,
    replyLid,
    userLid,
    fullArgs,
    sendReply,
    sendSuccessReact,
    sendErrorReply,
    socket,
    remoteJid,
  }) => {
    const reply = sendErrorReply || sendReply;
    const target = extractTarget({ args, replyLid, isReply });

    if (!target) {
      return await reply("Você precisa mencionar alguém, responder alguém ou passar o número.");
    }

    try {
      const digits = String(target).replace(/\D/g, "");
      const reason = String(fullArgs || "").replace(String(target), "").trim();

      const entry = await addToBlacklist({
        jid: digits || target,
        name: `@${digits || String(target).replace(/\D/g, "")}`,
        reason,
        addedBy: userLid,
      });

      // Banir automaticamente se estiver no grupo
      if (remoteJid && remoteJid.endsWith("@g.us")) {
        await socket.groupParticipantsUpdate(remoteJid, [digits || target], "remove");
      }

      if (sendSuccessReact) {
        await sendSuccessReact();
      }

      return await sendReply(
        `✅ Adicionado à blacklist:\n\n👤 ${entry.mention}\n📱 ${entry.number}`
      );
    } catch (error) {
      return await reply(error.message || "Erro ao adicionar na blacklist.");
    }
  },
};
