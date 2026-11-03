import { PREFIX } from "../../../config.js";
import {
  formatCoins,
  formatDuration,
  getUserEconomy,
  updateUserEconomy,
} from "../../../utils/economy.js";
import { getRandomNumber, getUserName } from "../../../utils/index.js";
import { economyBar, economyBox, economyLevelProgress, economyStats } from "./_visual.js";

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export default {
  name: "diario",
  description: "Recompensa diária",
  commands: ["diario", "daily"],
  usage: `${PREFIX}diario`,

  handle: async ({ sendReply, sendSuccessReact, userLid, webMessage }) => {
    const userName = getUserName(webMessage, userLid, "usuário");
    const eco = getUserEconomy(userLid, userName);

    const now = Date.now();
    const lastDaily = Number(eco.lastDaily) || 0;
    const remaining = COOLDOWN_MS - (now - lastDaily);

    if (remaining > 0) {
      return sendReply(economyBox(
        "🎁 𝐂𝐎𝐅𝐑𝐄 𝐃𝐈𝐀́𝐑𝐈𝐎 𝐅𝐄𝐂𝐇𝐀𝐃𝐎",
        `Você já coletou sua recompensa de hoje.
⏰ Novo resgate em: ${formatDuration(remaining)}

${economyBar(COOLDOWN_MS - remaining, COOLDOWN_MS)} 🔒`,
      ));
    }

    const reward = getRandomNumber(250, 700);
    const xpGain = getRandomNumber(10, 25);

    const updated = updateUserEconomy(userLid, userName, (data) => {
      data.coins += reward;
      data.xp += xpGain;
      data.lastDaily = now;
      data.name = userName;
      return data;
    });

    await sendSuccessReact();

    await sendReply(economyBox(
      updated.level > eco.level
        ? `🎉 𝐍𝐎𝐕𝐎 𝐍𝐈́𝐕𝐄𝐋: ${updated.level}`
        : "🎁 𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀 𝐃𝐈𝐀́𝐑𝐈𝐀",
      `${economyStats(updated)}

📦 𝐂𝐨𝐧𝐭𝐞𝐮́𝐝𝐨 𝐝𝐨 𝐜𝐨𝐟𝐫𝐞:
💵 +${formatCoins(reward)} XC$
⭐ +${xpGain} XP

${economyLevelProgress(updated)}
✨ Volte amanhã para abrir outro cofre!`,
    ));
  },
};