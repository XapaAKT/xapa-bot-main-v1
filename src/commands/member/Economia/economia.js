import { PREFIX } from "../../../config.js";
import { getUserEconomy } from "../../../utils/economy.js";
import { getUserName } from "../../../utils/index.js";
import { economyBox, economyLevelProgress, economyShortcuts, economyStats } from "./_visual.js";

export default {
  name: "economia",
  description: "Painel da economia",
  commands: ["economia", "eco", "money"],
  usage: `${PREFIX}economia`,

  handle: async ({ sendReply, sendSuccessReact, userLid, webMessage }) => {
    await sendSuccessReact();

    const userName = getUserName(webMessage, userLid, "usuário");
    const eco = getUserEconomy(userLid, userName);

    await sendReply(economyBox(
      "💎 𝐏𝐀𝐈𝐍𝐄𝐋 𝐃𝐎 𝐉𝐎𝐆𝐀𝐃𝐎𝐑",
      `${economyStats(eco)}

📈 𝐒𝐮𝐚 𝐣𝐨𝐫𝐧𝐚𝐝𝐚 𝐟𝐢𝐧𝐚𝐧𝐜𝐞𝐢𝐫𝐚 𝐞𝐬𝐭𝐚́ 𝐚𝐭𝐢𝐯𝐚!
${economyLevelProgress(eco)}
🧭 𝐄𝐬𝐜𝐨𝐥𝐡𝐚 𝐮𝐦𝐚 𝐚𝐜̧𝐚̃𝐨:

${economyShortcuts(PREFIX)}
💸 ${PREFIX}transferir <valor> @membro`,
    ));
  },
};