import { getProfile, buildProfileText } from "../../../services/rpgGame.js";
import { PREFIX } from "../../../config.js";
import { sendInteractiveButtons } from "../../../utils/interactive.js";
import { getUserName } from "../../../utils/index.js";

export default {
  name: "rpgperfil",
  description: "Mostra seu perfil, classe e status RPG.",
  commands: ["rpgperfil", "perfilrpg"],
  usage: "/perfil",
  requiresRpg: true,
  handle: async ({ userLid, sendReply, socket, remoteJid, webMessage }) => {
    const name = getUserName(webMessage, userLid, "Aventureiro");
    await sendReply(buildProfileText(await getProfile(userLid, name)));
    if (socket && remoteJid) {
      await sendInteractiveButtons(socket, remoteJid, {
        text: "╔═══ O que deseja fazer? ═══╗",
        footer: "✦ Crônicas do Reino ✦",
        buttons: [
          { id: `${PREFIX}explorar`, text: "🗺️ Explorar" },
          { id: `${PREFIX}mochila`, text: "🎒 Mochila" },
          { id: `${PREFIX}ajuda`, text: "📖 Guia" },
        ],
      });
    }
  },
};
