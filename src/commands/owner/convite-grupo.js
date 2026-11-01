import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";

export default {
  name: "convite-grupo",
  description: "Gera ou revoga o convite do grupo atual.",
  commands: ["convite-grupo", "convite"],
  usage: `${PREFIX}convite-grupo gerar|revogar`,
  handle: async ({ args, remoteJid, socket, isGroup, sendReply }) => {
    if (!isGroup) throw new WarningError("Use este comando em um grupo.");
    const action = String(args?.[0] || "gerar").toLowerCase();
    if (action === "gerar") {
      const code = await socket.groupInviteCode(remoteJid);
      return sendReply(`🔗 Convite atual:\nhttps://chat.whatsapp.com/${code}`);
    }
    if (action === "revogar") {
      await socket.groupRevokeInvite(remoteJid);
      return sendReply("♻️ Convite revogado. Um novo código foi criado pelo WhatsApp.");
    }
    throw new WarningError(`Use ${PREFIX}convite-grupo gerar ou ${PREFIX}convite-grupo revogar.`);
  },
};
