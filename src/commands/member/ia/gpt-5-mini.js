import { PREFIX } from "../../../config.js";

const DISABLED_REASON = "Os comandos de IA estão temporariamente desativados.";
export default {
  name: "gpt-5-mini",
  description: "Use a inteligência artificial GPT-5 Mini!",
  commands: ["gpt-5-mini", "gpt-5", "gpt"],
  usage: `${PREFIX}gpt-5-mini qual o sentido da vida?`,
  disabledReason: DISABLED_REASON,
  handle: async ({ sendWarningReply }) =>
    sendWarningReply(`🚫 ${DISABLED_REASON}`),
};
