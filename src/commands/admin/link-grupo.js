/**
 * Comando para obter o link do grupo
 *
 * Xapolin manda dms rsrs
 */
import { PREFIX } from "../../config.js";
import { DangerError } from "../../errors/index.js";
import {
  createNativeFlowButton,
  sendNativeFlowButtons,
} from "../../utils/interactive.js";
import { errorLog } from "../../utils/logger.js";

export default {
  name: "link-grupo",
  description: "Obtém o link do grupo",
  commands: ["link-grupo", "linkzin"],
  usage: `${PREFIX}link-grupo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    socket,
    sendReact,
    sendReply,
    sendErrorReply,
    remoteJid,
    webMessage,
  }) => {
    try {
      const groupCode = await socket.groupInviteCode(remoteJid);
      if (!groupCode) {
        throw new DangerError("Preciso ser admin!");
      }
      const groupInviteLink = `https://chat.whatsapp.com/${groupCode}`;
      await sendReact("🪀");
      await sendNativeFlowButtons(
        socket,
        remoteJid,
        {
          text: groupInviteLink,
          buttons: [
            createNativeFlowButton("cta_copy", {
              display_text: "📋 Copiar link",
              copy_code: groupInviteLink,
            }),
          ],
        },
        { quoted: webMessage },
      );
    } catch (error) {
      errorLog(error);
      await sendErrorReply("Preciso ser admin!");
    }
  },
};
