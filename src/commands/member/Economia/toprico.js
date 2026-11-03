import { PREFIX } from "../../../config.js";
import { formatCoins, getTopEconomy } from "../../../utils/economy.js";
import { economyBox } from "./_visual.js";
import { getLevelInfo } from "../../../utils/economy.js";

export default {
  name: "toprico",
  description: "Ranking dos mais ricos",
  commands: ["toprico", "ranking"],
  usage: `${PREFIX}toprico`,

  handle: async ({ sendReply, sendSuccessReact }) => {
    const ranking = getTopEconomy(10).filter((user) => Number(user.coins) > 0);

    await sendSuccessReact();

    if (!ranking.length) {
      return sendReply(economyBox(
        "🏆 𝐓𝐎𝐏 𝐑𝐈𝐂𝐎",
        "Ainda não há jogadores com saldo registrado.\nComece usando /diario ou /trabalhar!",
      ));
    }

    let text = "";

    ranking.forEach((user, index) => {
      const medal =
        index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏅";

      text += `${medal} 𝐍º${index + 1} • ${user.name || "usuário"}
   💰 ${formatCoins(user.coins)} XC$  ┃  🏅 Nv.${getLevelInfo(user.xp, user.level).level}  ┃  ⭐ ${formatCoins(user.xp)} XP

`;
    });

    await sendReply(economyBox("🏆 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐃𝐀 𝐑𝐈𝐐𝐔𝐄𝐙𝐀", text.trim()));
  },
};