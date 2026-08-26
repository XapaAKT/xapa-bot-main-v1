import { PREFIX } from "../../config.js";
import { formatCoins, getUserEconomy } from "../../utils/economy.js";
import { getUserName } from "../../utils/index.js";

export default {
  name: "saldo",
  description: "Mostra seu saldo",
  commands: ["saldo"],
  usage: `${PREFIX}saldo`,

  handle: async ({ sendReply, sendSuccessReact, userLid, webMessage }) => {
    await sendSuccessReact();

    const userName = getUserName(webMessage, userLid, "usuário");
    const eco = getUserEconomy(userLid, userName);

    await sendReply(`
╭━━━〔 💳 SALDO 〕━━━╮

👤 ${eco.name}
💵 ${formatCoins(eco.coins)} XC$
⭐ ${formatCoins(eco.xp)} XP

╰━━━━━━━━━━━━━━━━╯
`);
  },
};