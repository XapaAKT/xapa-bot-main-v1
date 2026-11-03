import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  activateJoinRequestNotification,
  deactivateJoinRequestNotification,
  isActiveJoinRequestNotification,
} from "../../utils/database.js";

export default {
  name: "join-request-notification",
  description: "Ativa ou desativa avisos de pedidos para entrar no grupo.",
  commands: [
    "join-request-notification",
    "notificar-entrada",
    "pedido-entrada",
    "solicitacao-entrada",
  ],
  usage: `${PREFIX}pedido-entrada 1|0`,

  handle: async ({ args, remoteJid, sendReply, sendSuccessReact }) => {
    if (!remoteJid?.endsWith("@g.us")) {
      throw new WarningError("Este comando só pode ser usado dentro de um grupo.");
    }

    if (!args.length || !["0", "1"].includes(args[0])) {
      throw new InvalidParameterError(
        `Use 1 para ativar ou 0 para desativar.\nExemplo: ${PREFIX}pedido-entrada 0`,
      );
    }

    const shouldEnable = args[0] === "1";
    const isEnabled = isActiveJoinRequestNotification(remoteJid);

    if (shouldEnable === isEnabled) {
      throw new WarningError(
        `A notificação de pedidos de entrada já está ${
          shouldEnable ? "ativada" : "desativada"
        } neste grupo.`,
      );
    }

    if (shouldEnable) {
      activateJoinRequestNotification(remoteJid);
    } else {
      deactivateJoinRequestNotification(remoteJid);
    }

    await sendSuccessReact();
    await sendReply(
      shouldEnable
        ? "✅ Notificações de pedidos de entrada ativadas neste grupo."
        : "🔕 Notificações de pedidos de entrada desativadas neste grupo.",
    );
  },
};
