import { PREFIX } from "../../config.js";
import {
  formatCoins,
  formatDuration,
  getUserEconomy,
  updateUserEconomy,
} from "../../utils/economy.js";
import { getRandomNumber, getUserName } from "../../utils/index.js";

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
      return sendReply(`
╭━━━〔 🎁 DIÁRIO 〕━━━╮

Você já pegou sua recompensa diária.
Volte em ${formatDuration(remaining)}.

╰━━━━━━━━━━━━━━━━━━╯
`);
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

    await sendReply(`
╭━━━〔 🎁 DIÁRIO 〕━━━╮

👤 ${updated.name}
💵 Recompensa: ${formatCoins(reward)} XC$
⭐ XP ganho: ${xpGain}

💳 Saldo atual: ${formatCoins(updated.coins)} XC$

╰━━━━━━━━━━━━━━━━━━╯
`);
  },
};