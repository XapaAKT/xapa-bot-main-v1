import { abandonChildFromFamily } from "../../../services/family.js";
import { extractTargetJid } from "../../../utils/family.js";

export default {
  name: "abandonar",
  description: "Remove um filho da família.",
  commands: ["abandonar"],
  usage: "/abandonar @filho",

  handle: async ({
    args,
    isReply,
    replyLid,
    userLid,
    sendReply,
    sendText,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    const targetJid = extractTargetJid({ args, isReply, replyLid });
    const reply = sendErrorReply || sendReply;

    if (!targetJid) {
      return await reply("Você precisa mencionar ou responder o filho que quer abandonar.");
    }

    try {
      const family = await abandonChildFromFamily(userLid, targetJid);

      if (sendSuccessReact) await sendSuccessReact();

      const text = `👶 Filho removido da família com sucesso.\n\nFamília: ${family.name}`;

      if (sendText) {
        await sendText(text, [targetJid]);
      } else {
        await sendReply(text);
      }
    } catch (error) {
      return await reply(error.message || "Erro ao abandonar filho.");
    }
  },
};