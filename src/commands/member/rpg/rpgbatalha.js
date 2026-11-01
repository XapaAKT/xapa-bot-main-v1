import { getAvatarBuffer, renderBattleCanvas, startBattle } from "../../../services/rpgGame.js";
import { PREFIX } from "../../../config.js";
import { sendInteractiveButtons } from "../../../utils/interactive.js";
import { getUserName } from "../../../utils/index.js";

export default {
  name: "rpgbatalha",
  description: "Desafia um monstro específico.",
  commands: ["rpgbatalha", "monstro", "batalha"],
  usage: "/batalha slime|goblin|lobo|dragao",
  requiresRpg: true,
  handle: async ({ args, userLid, sendReply, sendImageFromBuffer, socket, remoteJid, webMessage, sendReact, sendTypingState }) => {
    const name = getUserName(webMessage, userLid, "Aventureiro");
    await sendTypingState();
    const result = await startBattle(userLid, args?.[0], name);
    await sendReply(result.text);
    await sendReact("⚔️");
    if (sendImageFromBuffer) await sendImageFromBuffer(await renderBattleCanvas(userLid, name, await getAvatarBuffer(socket, userLid)), "⚔️ O duelo começou!");
    if (socket && remoteJid) {
      await sendInteractiveButtons(socket, remoteJid, {
        text: "⚔️ A batalha começou! Escolha sua ação:",
        footer: "✦ Arena dos Antigos ✦",
        buttons: [
          { id: `${PREFIX}ataca`, text: "⚔️ Atacar" },
          { id: `${PREFIX}fugir`, text: "🏃 Fugir" },
        ],
      });
    }
  },
};
