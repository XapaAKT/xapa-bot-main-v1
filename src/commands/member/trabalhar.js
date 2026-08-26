import { PREFIX } from "../../config.js";
import {
  formatCoins,
  formatDuration,
  getUserEconomy,
  updateUserEconomy,
} from "../../utils/economy.js";
import { getRandomNumber, getUserName } from "../../utils/index.js";

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
      return sendReply(`
╭━━━〔 ⏳ TRABALHO 〕━━━╮

Aguarde mais ${formatDuration(remaining)} para trabalhar novamente.

╰━━━━━━━━━━━━━━━━━━━━╯
`);
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

    await sendReply(`
╭━━━〔 💼 TRABALHO 〕━━━╮

👤 ${updated.name}
🛠️ Você trabalhou como ${job}
💵 Recebeu ${formatCoins(reward)} XC$
⭐ Ganhou ${xpGain} XP

💳 Saldo atual: ${formatCoins(updated.coins)} XC$

╰━━━━━━━━━━━━━━━━━━╯
`);
  },
};