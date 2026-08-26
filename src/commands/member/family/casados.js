import { getFamilyRanking, familyToMentions } from "../../../services/family.js";

export default {
  name: "casados",
  description: "Lista os casais ativos.",
  commands: ["casados"],
  usage: "/casados",

  handle: async ({
    sendReply,
    sendText,
    sendErrorReply,
  }) => {
    const reply = sendErrorReply || sendReply;

    try {
      const ranking = await getFamilyRanking();

      if (!ranking.length) {
        return await reply("Ainda não existem casais ativos.");
      }

      const lines = ranking.slice(0, 10).map((family, index) => {
        const spouses = (family.spouses || []).map((jid) => `@${String(jid).replace(/\D/g, "")}`).join(" ❤️ ");
        const children = Array.isArray(family.children) ? family.children.length : 0;
        return `【 ${index + 1} 】 ${family.name}\n💍 ${spouses || "-"}\n👶 Filhos: ${children}`;
      });

      const text = `╭━━━━━━━━━━━━━⛓️\n│ 『 CASADOS 』\n│\n${lines.map((line) => `│ ${line.replace(/\n/g, "\n│ ")}`).join("\n│\n")}\n╰━━━━━━━━━━━━━━━━━━`;

      const mentions = ranking.flatMap((family) => familyToMentions(family));

      if (sendText) {
        await sendText(text, mentions);
      } else {
        await sendReply(text);
      }
    } catch (error) {
      return await reply(error.message || "Erro ao listar casais.");
    }
  },
};