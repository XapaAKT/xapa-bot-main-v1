import { attack, getAvatarBuffer, renderBattleCanvas } from "../../../services/rpgGame.js";
import { PREFIX } from "../../../config.js";
import { sendInteractiveButtons } from "../../../utils/interactive.js";
import { getUserName } from "../../../utils/index.js";

export default {
  name: "rpgatacar",
  description: "Ataca o monstro da batalha atual.",
  commands: ["rpgatacar", "atacar", "ataca"],
  usage: "/ataca",
  requiresRpg: true,
  handle: async ({ userLid, sendReply, sendImageFromBuffer, socket, remoteJid, webMessage, sendReact, sendTypingState }) => {
    const name = getUserName(webMessage, userLid, "Aventureiro");
    await sendTypingState();
    const result = await attack(userLid, name);
    if (result.critical) await sendReact("💥");
    else await sendReact("⚔️");
    await sendReply(result.text);
    if (result.loot) await sendReact("🎁");
    if (result.levelUp) await sendReact("🆙");
    if (sendImageFromBuffer) await sendImageFromBuffer(await renderBattleCanvas(userLid, name, await getAvatarBuffer(socket, userLid)), "⚔️ Rodada concluída");
    if (result.victory) {
      await sendReply(`╔═══〔 🏆 VITÓRIA GLORIOSA 〕═══╗
║ 𖤐 ${name} venceu no campo de batalha!
║ ✦ Loot: ${result.loot}
║ ✧ XP conquistado: ${result.levelUp ? "SUBIU DE NÍVEL!" : "adicionado ao grimório"}
╚══════════════════════════════╝`);
      await sendReact(result.levelUp ? "👑" : "🏆");
    }
    if (socket && remoteJid) {
      await sendInteractiveButtons(socket, remoteJid, {
        text: "A arena aguarda sua próxima decisão:",
        footer: "✦ Arena dos Antigos ✦",
        buttons: [
          { id: `${PREFIX}ataca`, text: "⚔️ Atacar novamente" },
          { id: `${PREFIX}fugir`, text: "🏃 Fugir" },
        ],
      });
    }
  },
};
