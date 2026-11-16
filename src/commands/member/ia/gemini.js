import { PREFIX } from "../../../config.js";

const DISABLED_REASON = "Os comandos de IA estão temporariamente desativados.";
export default {
  name: "gemini",
  description: "Conversa com o Gemini através da Tokito APIs.",
  commands: ["gemini"],
  usage: `${PREFIX}gemini sua pergunta`,
  disabledReason: DISABLED_REASON,
  handle: async ({ sendWarningReply }) =>
    sendWarningReply(`🚫 ${DISABLED_REASON}`),
};