import { divorceFamilyByJid } from "../../../services/family.js";

export default {
  name: "divorciar",
  description: "Termina a família ativa.",
  commands: ["divorciar"],
  usage: "/divorciar",

  handle: async ({
    userLid,
    sendReply,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    const reply = sendErrorReply || sendReply;

    try {
      const family = await divorceFamilyByJid(userLid);

      if (sendSuccessReact) await sendSuccessReact();

      await sendReply(
        `💔 Divórcio realizado com sucesso.\n\nFamília: ${family.name}`,
      );
    } catch (error) {
      return await reply(error.message || "Erro ao divorciar.");
    }
  },
};