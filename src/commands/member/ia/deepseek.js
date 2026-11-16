import { PREFIX } from "../../../config.js";

const DISABLED_REASON = "Os comandos de IA estão temporariamente desativados.";
export default {
  name: "deepseek",
  description: "Use a inteligência artificial DeepSeek V4 Flash!",
  commands: ["deepseek", "deep-seek"],
  usage: `${PREFIX}deepseek Crie um resumo curto sobre inteligência artificial`,
  disabledReason: DISABLED_REASON,
  handle: async ({ sendWarningReply }) =>
    sendWarningReply(`🚫 ${DISABLED_REASON}`),
};
