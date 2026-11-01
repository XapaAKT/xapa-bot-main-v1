import { PREFIX } from "../../config.js";

export default {
  name: "contexto-demo",
  description: "Demonstra uma citação claramente identificada como teste.",
  commands: ["contexto-demo", "fakequote-demo"],
  usage: `${PREFIX}contexto-demo`,
  handle: async ({ sendReply, sendReact }) => {
    await sendReply(`╔═══〔 🧪 CITAÇÃO DE TESTE 〕═══╗
║ Esta mensagem é uma demonstração local.
║ Não representa publicação, canal ou pessoa real.
╚══════════════════════════════╝`);
    return sendReact("🧪");
  },
};
