import { PREFIX } from "../../config.js";
import {
  formatCoins,
  getUserEconomy,
  updateUserEconomy,
} from "../../utils/economy.js";
import { getRandomNumber, getUserName, onlyNumbers } from "../../utils/index.js";

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
      return sendReply(`
╭━━━〔 🎰 CASSINO 〕━━━╮

Uso:
${PREFIX}cassino <valor|all>

Exemplo:
${PREFIX}cassino 500

╰━━━━━━━━━━━━━━━━━━━━╯
`);
    }

    if (eco.coins < bet) {
      return sendReply(`
╭━━━〔 🎰 CASSINO 〕━━━╮

Saldo insuficiente.
Seu saldo atual: ${formatCoins(eco.coins)} XC$

╰━━━━━━━━━━━━━━━━━━━━╯
`);
    }

    const reels = [rollSymbol(), rollSymbol(), rollSymbol()];

    const hasTriple = reels[0] === reels[1] && reels[1] === reels[2];
    const hasPair =
      !hasTriple &&
      (reels[0] === reels[1] || reels[0] === reels[2] || reels[1] === reels[2]);

    let prize = 0;
    let resultText = "❌ Você perdeu.";

    if (hasTriple) {
      prize = bet * 5;
      resultText = "💎 JACKPOT! Você ganhou muito!";
    } else if (hasPair) {
      prize = bet * 2;
      resultText = "✨ Boa! Você teve uma combinação parcial.";
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

    await sendReply(`
╭━━━〔 🎰 CASSINO 〕━━━╮

🎲 ${reels.join(" | ")}
${resultText}

💸 Aposta: ${formatCoins(bet)} XC$
${prize > 0 ? `🏆 Premio total: ${formatCoins(prize)} XC$\n` : ""}
💳 Saldo atual: ${formatCoins(updated.coins)} XC$

╰━━━━━━━━━━━━━━━━━━━━╯
`);
  },
};