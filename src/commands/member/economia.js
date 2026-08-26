import { PREFIX } from "../../config.js";
import { formatCoins, getUserEconomy } from "../../utils/economy.js";
import { getUserName } from "../../utils/index.js";

export default {
  name: "economia",
  description: "Painel da economia",
  commands: ["economia", "eco", "money"],
  usage: `${PREFIX}economia`,

  handle: async ({ sendReply, sendSuccessReact, userLid, webMessage }) => {
    await sendSuccessReact();

    const userName = getUserName(webMessage, userLid, "usuário");
    const eco = getUserEconomy(userLid, userName);

    await sendReply(`
╭━━━〔 💰 ECONOMIA 〕━━━╮

👤 ${eco.name}
💵 Saldo: ${formatCoins(eco.coins)} XC$
⭐ XP: ${formatCoins(eco.xp)}

╭──────────────╮
│ /saldo
│ /trabalhar
│ /diario
│ /transferir
│ /toprico
╰──────────────╯

╰━━━━━━━━━━━━━━━━━━╯
`);
  },
};