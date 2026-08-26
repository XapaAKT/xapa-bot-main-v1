import {
  getFamilyRanking,
  buildRankingText,
  familyToMentions,
} from "../../../services/family.js";

export default {
  name: "rankingfamilia",
  description: "Mostra o ranking das famílias.",
  commands: ["rankingfamilia", "rankfamilia"],
  usage: "/rankingfamilia",

  handle: async ({
    sendReply,
    sendText,
    sendErrorReply,
  }) => {
    const reply = sendErrorReply || sendReply;

    try {
      const ranking = await getFamilyRanking();

      if (!ranking.length) {
        return await reply("Ainda não existe nenhuma família ativa.");
      }

      const text = buildRankingText(ranking);
      const mentions = ranking.flatMap((family) => familyToMentions(family));

      if (sendText) {
        await sendText(text, mentions);
      } else {
        await sendReply(text);
      }
    } catch (error) {
      return await reply(error.message || "Erro ao carregar ranking.");
    }
  },
};