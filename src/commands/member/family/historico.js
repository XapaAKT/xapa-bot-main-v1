import { getFamilyHistoryForJid, buildHistoryText } from "../../../services/family.js";

export default {
  name: "historico",
  description: "Mostra o histórico da família.",
  commands: ["historico", "histórico"],
  usage: "/historico",

  handle: async ({
    userLid,
    sendReply,
    sendText,
    sendErrorReply,
  }) => {
    const reply = sendErrorReply || sendReply;

    try {
      const history = await getFamilyHistoryForJid(userLid);

      if (!history.length) {
        return await reply("Não encontrei histórico da sua família.");
      }

      const text = buildHistoryText(history);

      if (sendText) {
        await sendText(text);
      } else {
        await sendReply(text);
      }
    } catch (error) {
      return await reply(error.message || "Erro ao carregar histórico.");
    }
  },
};