import { PREFIX } from "../../config.js";
import { formatCoins, getTopEconomy } from "../../utils/economy.js";

export default {
  name: "toprico",
  description: "Ranking dos mais ricos",
  commands: ["toprico", "ranking"],
  usage: `${PREFIX}toprico`,

  handle: async ({ sendReply, sendSuccessReact }) => {
    const ranking = getTopEconomy(10).filter((user) => Number(user.coins) > 0);

    await sendSuccessReact();

    if (!ranking.length) {
      return sendReply("Ainda não há ninguém com saldo registrado.");
    }

    let text = `
╭━━━〔 🏆 TOP RICO 〕━━━╮

`;

    ranking.forEach((user, index) => {
      const medal =
        index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏅";

      text += `
${medal} ${index + 1}º
👤 ${user.name || "usuário"}
💵 ${formatCoins(user.coins)} XC$
⭐ ${formatCoins(user.xp)} XP
`;
    });

    text += `
╰━━━━━━━━━━━━━━━━━━━━╯
`;

    await sendReply(text);
  },
};