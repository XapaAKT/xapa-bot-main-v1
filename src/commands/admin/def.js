import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";

import {
  activateAntiLinkGroup,
  deactivateAntiLinkGroup,
  updateIsActiveGroupRestriction,
} from "../../utils/database.js";

export default {
  name: "def",
  description: "Ativa ou desativa todas as proteções do grupo.",
  commands: ["def"],
  usage: `${PREFIX}def (1/0)`,

  handle: async ({
    remoteJid,
    isGroup,
    args,
    sendSuccessReply,
  }) => {
    if (!isGroup) {
      throw new WarningError(
        "Este comando só pode ser usado em grupos!"
      );
    }

    if (!args.length) {
      throw new InvalidParameterError(
        "Use 1 para ligar ou 0 para desligar."
      );
    }

    const enable = args[0] === "1";
    const disable = args[0] === "0";

    if (!enable && !disable) {
      throw new InvalidParameterError(
        "Use apenas 1 ou 0."
      );
    }

    // anti-link
    if (enable) {
      activateAntiLinkGroup(remoteJid);
    } else {
      deactivateAntiLinkGroup(remoteJid);
    }

    // demais anti's
    updateIsActiveGroupRestriction(
      remoteJid,
      "anti-video",
      enable
    );

    updateIsActiveGroupRestriction(
      remoteJid,
      "anti-document",
      enable
    );

    updateIsActiveGroupRestriction(
      remoteJid,
      "anti-event",
      enable
    );

    updateIsActiveGroupRestriction(
      remoteJid,
      "anti-image",
      enable
    );

    updateIsActiveGroupRestriction(
      remoteJid,
      "anti-payment",
      enable
    );

    updateIsActiveGroupRestriction(
      remoteJid,
      "anti-product",
      enable
    );

    updateIsActiveGroupRestriction(
      remoteJid,
      "anti-status-grupo",
      enable
    );

    await sendSuccessReply(
      enable
        ? `🛡️ DEFESA XIC ATIVADA

✓ anti-link
✓ anti-video
✓ anti-document
✓ anti-event
✓ anti-image
✓ anti-payment
✓ anti-product
✓ anti-status-grupo

XIC://FORTRESS_MODE_ON`
        : `☠️ DEFESA XIC DESATIVADA

✗ anti-link
✗ anti-video
✗ anti-document
✗ anti-event
✗ anti-image
✗ anti-payment
✗ anti-product
✗ anti-status-grupo

XIC://FORTRESS_MODE_OFF`
    );
  },
};