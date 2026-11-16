import { PREFIX } from "../../../config.js";

const DISABLED_REASON = "Os comandos de IA estão temporariamente desativados.";
export default {
  name: "ia-sticker",
  description: "Crie uma figurinha com base em uma descrição",
  commands: ["ia-sticker", "ia-fig"],
  usage: `${PREFIX}ia-sticker descrição`,
  disabledReason: DISABLED_REASON,
  handle: async ({ sendWarningReply }) =>
    sendWarningReply(`🚫 ${DISABLED_REASON}`),
};
