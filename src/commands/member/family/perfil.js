import { PREFIX } from "../../../config.js";
import { getProfile } from "../../../database/profile.js";
import { getUserEconomy } from "../../../utils/economy.js";
import { getUserName } from "../../../utils/index.js";
import { getPlayer } from "../../../database/rpg.js";
import { getUserSummary } from "../../../services/pokemonGame.js";
import { renderProfileCanvas } from "../canvas/testecanvas.js";
import { isActiveRpgGroup } from "../../../utils/database.js";
import { buildProfileText, getProfile as getRpgProfile } from "../../../services/rpgGame.js";

export default {
  name: "perfil",
  description: "Mostra o perfil personalizado em canvas.",
  commands: ["perfil"],
  usage: `${PREFIX}perfil`,

  handle: async ({
    userLid,
    webMessage,
    sendReply,
    sendImageFromBuffer,
    sendWaitReact,
    sendSuccessReact,
    remoteJid,
  }) => {
    try {
      if (remoteJid?.endsWith("@g.us") && isActiveRpgGroup(remoteJid)) {
        const rpgProfile = await getRpgProfile(userLid, getUserName(webMessage, userLid, "Aventureiro"));
        await sendReply(buildProfileText(rpgProfile));
        return;
      }
      await sendWaitReact();
      const profile = getProfile(userLid);
      const name = profile.displayName || getUserName(webMessage, userLid, "Usuário");
      const economy = getUserEconomy(userLid, name);
      const player = getPlayer(userLid);
      const pokemonSummary = await getUserSummary(userLid);
      const canvas = await renderProfileCanvas(
        name,
        profile,
        economy,
        player,
        pokemonSummary,
      );

      await sendImageFromBuffer(canvas, "⛓️ ULQUIORRA BOT // PERFIL");
      await sendSuccessReact();
    } catch (error) {
      await sendReply(
        error.message || "Não foi possível gerar seu perfil em canvas.",
      );
    }
  },
};