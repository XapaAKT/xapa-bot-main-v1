import { PREFIX } from "../../../config.js";
import {
  formatCoins,
  formatDuration,
  getUserEconomy,
  updateUserEconomy,
} from "../../../utils/economy.js";
import { getRandomNumber, getUserName } from "../../../utils/index.js";
import { economyBar, economyBox, economyLevelProgress, economyStats } from "./_visual.js";

const COOLDOWN_MS = 30 * 60 * 1000;

const jobs = [
  "programador",
  "entregador",
  "fazendeiro",
  "carteiro",
  "pedreiro",
  "designer",
  "streamer",
  "músico",
  "cozinheiro",
  "garçom",
];

export default {
  name: "trabalhar",
  description: "Trabalhe e ganhe moedas",
  commands: ["trabalhar", "work"],
  usage: `${PREFIX}trabalhar`,

  handle: async ({ sendReply, sendSuccessReact, userLid, webMessage }) => {
    const userName = getUserName(webMessage, userLid, "usuário");
    const eco = getUserEconomy(userLid, userName);

    const now = Date.now();
    const lastWork = Number(eco.lastWork) || 0;
    const remaining = COOLDOWN_MS - (now - lastWork);

    if (remaining > 0) {
      return sendReply(economyBox(
        "⏳ 𝐓𝐔𝐑𝐍𝐎 𝐄𝐌 𝐃𝐄𝐒𝐂𝐀𝐍𝐒𝐎",
        `🛌 Você já cumpriu seu expediente.
⏰ Próximo turno em: ${formatDuration(remaining)}

${economyBar(COOLDOWN_MS - remaining, COOLDOWN_MS)} ⏳`,
      ));
    }

    const job = jobs[getRandomNumber(0, jobs.length - 1)];
    const reward = getRandomNumber(80, 250);
    const xpGain = getRandomNumber(5, 15);

    const updated = updateUserEconomy(userLid, userName, (data) => {
      data.coins += reward;
      data.xp += xpGain;
      data.lastWork = now;
      data.name = userName;
      return data;
    });

    await sendSuccessReact();

    await sendReply(economyBox(
      updated.level > eco.level
        ? `🎉 𝐍𝐎𝐕𝐎 𝐍𝐈́𝐕𝐄𝐋: ${updated.level}`
        : "💼 𝐏𝐀𝐆𝐀𝐌𝐄𝐍𝐓𝐎 𝐑𝐄𝐂𝐄𝐁𝐈𝐃𝐎",
      `${economyStats(updated)}

🛠️ 𝐂𝐚𝐫𝐠𝐨: ${job}
💵 𝐒𝐚𝐥𝐚́𝐫𝐢𝐨: +${formatCoins(reward)} XC$
⭐ 𝐁𝐨̂𝐧𝐮𝐬 𝐝𝐞 𝐗𝐏: +${xpGain}

${economyLevelProgress(updated)}`,
    ));
  },
};