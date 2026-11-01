import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import { isActiveRpgGroup, setRpgGroup } from "../../utils/database.js";

export default {
  name: "rpg",
  description: "Ativa ou desativa o sistema de RPG no grupo.",
  commands: ["rpg"],
  usage: `${PREFIX}rpg on|off|status`,
  handle: async ({ args, remoteJid, isGroup, sendSuccessReply }) => {
    if (!isGroup) throw new WarningError("⚠️ Esse comando só pode ser usado em grupos.");
    const action = String(args?.[0] || "status").toLowerCase();
    if (!["on", "off", "status"].includes(action)) {
      throw new WarningError(`Use ${PREFIX}rpg on, ${PREFIX}rpg off ou ${PREFIX}rpg status.`);
    }
    if (action === "status") {
      return sendSuccessReply(`⚔️ RPG: ${isActiveRpgGroup(remoteJid) ? "ATIVO" : "DESATIVADO"}`);
    }
    setRpgGroup(remoteJid, action === "on");
    return sendSuccessReply(
      action === "on"
        ? "⚔️ RPG ativado! Use /rpgperfil para começar sua aventura."
        : "🛑 RPG desativado neste grupo. Seus personagens continuam salvos.",
    );
  },
};
