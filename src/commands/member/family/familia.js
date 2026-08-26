import { getFamilyByJid, familyToMentions, buildFamilyText } from "../../../services/family.js";

export default {
  name: "familia",
  description: "Mostra a família atual.",
  commands: ["familia", "família"],
  usage: "/familia",

  handle: async ({
    userLid,
    sendReply,
    sendText,
    sendErrorReply,
  }) => {
    const reply = sendErrorReply || sendReply;

    try {
      const family = await getFamilyByJid(userLid);

      if (!family) {
        return await reply("Você não faz parte de nenhuma família ativa.");
      }

      const text = buildFamilyText(family);
      const mentions = familyToMentions(family);

      if (sendText) {
        await sendText(text, mentions);
      } else {
        await sendReply(text);
      }
    } catch (error) {
      return await reply(error.message || "Erro ao carregar família.");
    }
  },
};