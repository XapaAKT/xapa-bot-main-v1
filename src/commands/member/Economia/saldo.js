import { PREFIX } from "../../../config.js";
import { getUserEconomy } from "../../../utils/economy.js";
import { getUserName } from "../../../utils/index.js";
import { economyBox, economyLevelProgress, economyStats, economyShortcuts } from "./_visual.js";

export default {
  name: "saldo",
  description: "Mostra seu saldo",
  commands: ["saldo"],
  usage: `${PREFIX}saldo`,

  handle: async ({ sendReply, sendSuccessReact, userLid, webMessage }) => {
    await sendSuccessReact();

    const userName = getUserName(webMessage, userLid, "usuário");
    const eco = getUserEconomy(userLid, userName);

    await sendReply(economyBox(
      "💳 𝐂𝐎𝐍𝐓𝐀 𝐃𝐈𝐆𝐈𝐓𝐀𝐋",
      `${economyStats(eco)}

🔐 𝐒𝐭𝐚𝐭𝐮𝐬: 🟢 𝐀𝐭𝐢𝐯𝐚
🪙 𝐌𝐨𝐞𝐝𝐚: XC$ • 𝐗𝐚𝐩𝐚 𝐂𝐨𝐢𝐧𝐬
${economyLevelProgress(eco)}

${economyShortcuts(PREFIX)}`,
    ));
  },
};