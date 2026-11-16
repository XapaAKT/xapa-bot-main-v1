import { PREFIX } from "../../config.js";

const DISABLED_REASON =
  "O serviço Spider X que fornecia a troca de proxy foi desativado.";
export default {
  name: "set-proxy",
  description: "Troca a proxy da Spider X API",
  commands: ["set-proxy"],
  usage: `${PREFIX}set-proxy <nova_proxy>`,
  disabledReason: DISABLED_REASON,
  handle: async ({ sendWarningReply }) =>
    sendWarningReply(`🚫 ${DISABLED_REASON}`),
};
