import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";

const DISAPPEARING_TIME_IN_SECONDS = 86400;

export default {
  name: "sumir",
  description: "Ativa mensagens temporárias por 24 horas no chat.",
  commands: ["sumir", "mensagem-temporaria", "mensagens-temporarias"],
  usage: `${PREFIX}sumir [on|off]`,
  handle: async ({ args, remoteJid, socket, isGroup, sendSuccessReply }) => {
    if (!isGroup) throw new WarningError("Use este comando em um grupo.");
    const action = String(args?.[0] || "on").toLowerCase();
    const value =
      action === "on" || action === "ativar"
        ? DISAPPEARING_TIME_IN_SECONDS
        : action === "off" || action === "desativar"
          ? 0
          : null;
    if (value === null) {
      throw new WarningError(`Use ${PREFIX}sumir ou ${PREFIX}sumir off.`);
    }
    await socket.sendMessage(remoteJid, { disappearingMessagesInChat: value });
    return sendSuccessReply(
      value
        ? "⏳ Mensagens temporárias ativadas por 24 horas (86400 segundos)."
        : "⏳ Mensagens temporárias desativadas.",
    );
  },
};
