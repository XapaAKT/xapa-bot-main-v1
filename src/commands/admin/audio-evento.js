import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  activateOwnerReplyAudio,
  deactivateOwnerReplyAudio,
  isActiveOwnerReplyAudio,
} from "../../utils/database.js";

export default {
  name: "audio-evento",
  description: "Ativa ou desativa o áudio ao responder mensagens do dono.",
  commands: ["audio-evento", "audioevento"],
  usage: `${PREFIX}audio-evento (1/0)`,

  handle: async ({ args, isGroup, remoteJid, sendSuccessReply }) => {
    if (!isGroup) {
      throw new WarningError("Este comando só pode ser usado em grupos!");
    }

    if (args[0] !== "1" && args[0] !== "0") {
      throw new InvalidParameterError(
        `Use ${PREFIX}audio-evento 1 para ligar ou ${PREFIX}audio-evento 0 para desligar.`
      );
    }

    const shouldEnable = args[0] === "1";
    const isEnabled = isActiveOwnerReplyAudio(remoteJid);

    if (shouldEnable === isEnabled) {
      throw new WarningError(
        `O áudio-evento já está ${shouldEnable ? "ligado" : "desligado"}!`
      );
    }

    if (shouldEnable) {
      activateOwnerReplyAudio(remoteJid);
    } else {
      deactivateOwnerReplyAudio(remoteJid);
    }

    await sendSuccessReply(
      `Áudio-evento ${shouldEnable ? "ligado" : "desligado"} com sucesso!`
    );
  },
};
