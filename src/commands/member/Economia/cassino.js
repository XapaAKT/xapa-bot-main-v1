import { PREFIX } from "../../../config.js";
import {
  formatCoins,
  getUserEconomy,
  updateUserEconomy,
} from "../../../utils/economy.js";
import { getRandomNumber, getUserName, onlyNumbers } from "../../../utils/index.js";
import { economyBox, economyStats } from "./_visual.js";

const symbols = ["🍒", "🍋", "🔔", "💎", "7️⃣", "⭐", "🍀"];

function rollSymbol() {
  return symbols[getRandomNumber(0, symbols.length - 1)];
}

export default {
  name: "cassino",
  description: "Jogo de cassino com moedas virtuais",
  commands: ["cassino", "slot"],
  usage: `${PREFIX}cassino <valor|all>`,

  handle: async ({ args, sendReply, sendSuccessReact, userLid, webMessage }) => {
    const userName = getUserName(webMessage, userLid, "usuário");
    const eco = getUserEconomy(userLid, userName);

    const betArg = String(args[0] || "").toLowerCase();

    let bet = 0;
    if (betArg === "all" || betArg === "tudo") {
      bet = eco.coins;
    } else {
      bet = Number(onlyNumbers(betArg));
    }

    if (!bet || bet <= 0) {
      return sendReply(economyBox(
        "🎰 𝐂𝐀𝐒𝐒𝐈𝐍𝐎 𝐗𝐈𝐂",
        `Aposte suas XC$ e tente a sorte!

📌 Uso: ${PREFIX}cassino <valor|all>
💡 Exemplo: ${PREFIX}cassino 500
🎯 Trinca paga 5x • Par paga 2x`,
      ));
    }

    if (eco.coins < bet) {
      return sendReply(economyBox(
        "🚫 𝐀𝐏𝐎𝐒𝐓𝐀 𝐍𝐄𝐆𝐀𝐃𝐀",
        `Saldo insuficiente para essa rodada.
💳 Seu saldo: ${formatCoins(eco.coins)} XC$
🎲 Sua aposta: ${formatCoins(bet)} XC$`,
      ));
    }

    const reels = [rollSymbol(), rollSymbol(), rollSymbol()];

    const hasTriple = reels[0] === reels[1] && reels[1] === reels[2];
    const hasPair =
      !hasTriple &&
      (reels[0] === reels[1] || reels[0] === reels[2] || reels[1] === reels[2]);

    let prize = 0;
    let resultText = "❌ 𝐀 𝐒𝐎𝐑𝐓𝐄 𝐍𝐀̃𝐎 𝐕𝐄𝐈𝐎.";

    if (hasTriple) {
      prize = bet * 5;
      resultText = "💎 𝐉𝐀𝐂𝐊𝐏𝐎𝐓! A banca foi quebrada!";
    } else if (hasPair) {
      prize = bet * 2;
      resultText = "✨ 𝐏𝐀𝐑 𝐏𝐄𝐑𝐅𝐄𝐈𝐓𝐎! Prêmio parcial liberado.";
    }

    const updated = updateUserEconomy(userLid, userName, (data) => {
      data.coins -= bet;
      data.xp += getRandomNumber(1, 5);

      if (prize > 0) {
        data.coins += prize;
      }

      data.name = userName;
      return data;
    });

    await sendSuccessReact();

    await sendReply(economyBox(
      "🎰 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 𝐃𝐀 𝐑𝐎𝐃𝐀𝐃𝐀",
      `${economyStats(updated)}

╭──────────────╮
│  ${reels.join("  │  ")}  │
╰──────────────╯

${resultText}
💸 𝐀𝐩𝐨𝐬𝐭𝐚: ${formatCoins(bet)} XC$
${prize > 0 ? `🏆 𝐏𝐫𝐞̂𝐦𝐢𝐨: +${formatCoins(prize)} XC$\n` : "🪙 𝐏𝐫𝐞̂𝐦𝐢𝐨: 0 XC$\n"}💳 𝐒𝐚𝐥𝐝𝐨 𝐟𝐢𝐧𝐚𝐥: ${formatCoins(updated.coins)} XC$`,
    ));
  },
};