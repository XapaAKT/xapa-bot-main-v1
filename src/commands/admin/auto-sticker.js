import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  activateAutoStickerGroup,
  deactivateAutoStickerGroup,
  isActiveAutoStickerGroup,
} from "../../utils/database.js";

export default {
  name: "auto-sticker",
  description:
    "Ativa/desativa figurinhas automáticas com a mesma assinatura do comando sticker.",
  commands: ["auto-sticker", "auto-figu", "auto-fig", "auto-stick"],
  usage: `${PREFIX}auto-sticker <1|0>`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendSuccessReact, remoteJid }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        `Use ${PREFIX}auto-sticker 1 para ativar ou ${PREFIX}auto-sticker 0 para desativar.`,
      );
    }

    const autoStickerOn = args[0] === "1";
    const autoStickerOff = args[0] === "0";

    if (!autoStickerOn && !autoStickerOff) {
      throw new InvalidParameterError(
        `Use ${PREFIX}auto-sticker 1 para ativar ou ${PREFIX}auto-sticker 0 para desativar.`,
      );
    }

    const hasActive = autoStickerOn && isActiveAutoStickerGroup(remoteJid);
    const hasInactive = autoStickerOff && !isActiveAutoStickerGroup(remoteJid);

    if (hasActive || hasInactive) {
      throw new WarningError(
        `O auto-sticker já está ${
          autoStickerOn ? "ativado" : "desativado"
        }!`
      );
    }

    if (autoStickerOn) {
      activateAutoStickerGroup(remoteJid);
    } else {
      deactivateAutoStickerGroup(remoteJid);
    }

    await sendSuccessReact();

    if (autoStickerOn) {
      await sendReply(
        "⛓️ Auto-sticker ativado!\n" +
          "As imagens e os vídeos permitidos serão convertidos automaticamente em figurinha com a mesma assinatura do comando sticker.",
      );
      return;
    }

    await sendReply("⛓️ Auto-sticker desativado com sucesso.");
  },
};
