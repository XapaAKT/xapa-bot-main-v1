import { PREFIX } from "../../../config.js";

const DISABLED_REASON = "Os comandos de IA estão temporariamente desativados.";
export default {
  name: "flux",
  description: "Cria uma imagem usando a IA Flux",
  commands: ["flux"],
  usage: `${PREFIX}flux descrição`,
  disabledReason: DISABLED_REASON,
  handle: async ({ sendWarningReply }) =>
    sendWarningReply(`🚫 ${DISABLED_REASON}`),
};
