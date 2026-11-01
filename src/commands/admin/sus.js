import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import { isActiveSusGroup, setSusGroup } from "../../utils/database.js";

export default {
  name: "sus",
  description: "Ativa ou desativa os comandos SUS do grupo.",
  commands: ["sus"],
  usage: `${PREFIX}sus on|off|status`,
  handle: async ({ args, remoteJid, isGroup, sendSuccessReply }) => {
    if (!isGroup) throw new WarningError("⚠️ Esse comando só pode ser usado em grupos.");
    const action = String(args?.[0] || "status").toLowerCase();
    if (!["on", "off", "status"].includes(action)) {
      throw new WarningError(`Use ${PREFIX}sus on, ${PREFIX}sus off ou ${PREFIX}sus status.`);
    }
    if (action === "status") {
      return sendSuccessReply(`🔞 Comandos SUS: ${isActiveSusGroup(remoteJid) ? "ATIVOS" : "DESATIVADOS"}`);
    }
    setSusGroup(remoteJid, action === "on");
    return sendSuccessReply(
      action === "on"
        ? "🔞 Comandos SUS ativados neste grupo."
        : "🔒 Comandos SUS desativados neste grupo.",
    );
  },
};
