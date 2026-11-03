import { PREFIX } from "../../../config.js";
import {
  formatCoins,
  extractMentionedJids,
  getQuotedParticipant,
  getUserEconomy,
  updateUserEconomy,
} from "../../../utils/economy.js";
import { getUserName, onlyNumbers } from "../../../utils/index.js";
import { economyBox } from "./_visual.js";

export default {
  name: "transferir",
  description: "Transfere moedas para outro membro",
  commands: ["transferir", "pagar"],
  usage: `${PREFIX}transferir <quantia> @membro`,

  handle: async ({
    args,
    sendReply,
    sendSuccessReact,
    userLid,
    webMessage,
    socket,
    remoteJid,
  }) => {
    const userName = getUserName(webMessage, userLid, "usuário");
    const senderEco = getUserEconomy(userLid, userName);

    const amount = Number(onlyNumbers(args[0] || ""));
    const mentioned = extractMentionedJids(webMessage);
    const quoted = getQuotedParticipant(webMessage);
    const targetJid = mentioned[0] || quoted || null;

    if (!amount || amount <= 0) {
      return sendReply(economyBox(
        "💸 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐄̂𝐍𝐂𝐈𝐀",
        `📌 Uso: ${PREFIX}transferir <valor> @membro
💡 Exemplo: ${PREFIX}transferir 500 @usuario

Envie moedas para outro jogador com segurança.`,
      ));
    }

    if (!targetJid) {
      return sendReply(economyBox(
        "🎯 𝐀𝐋𝐕𝐎 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎",
        `Marque alguém ou responda a uma mensagem.

💡 Exemplo: ${PREFIX}transferir 500 @usuario`,
      ));
    }

    if (String(targetJid) === String(userLid)) {
      return sendReply(economyBox(
        "🚫 𝐎𝐏𝐄𝐑𝐀𝐂̧𝐀̃𝐎 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐀",
        "Você não pode transferir XC$ para si mesmo.",
      ));
    }

    if (senderEco.coins < amount) {
      return sendReply(economyBox(
        "🚫 𝐒𝐀𝐋𝐃𝐎 𝐈𝐍𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄",
        `Você tentou enviar: ${formatCoins(amount)} XC$
Seu saldo disponível: ${formatCoins(senderEco.coins)} XC$`,
      ));
    }

    const targetName = "usuário";

    updateUserEconomy(userLid, userName, (data) => {
      data.coins -= amount;
      data.name = userName;
      data.xp += 1;
      return data;
    });

    const targetEco = updateUserEconomy(targetJid, targetName, (data) => {
      data.coins += amount;
      data.name = targetName;
      data.xp += 1;
      return data;
    });

    await sendSuccessReact();

    await socket.sendMessage(remoteJid, {
      text: economyBox(
        "✅ 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐄̂𝐍𝐂𝐈𝐀 𝐂𝐎𝐍𝐂𝐋𝐔𝐈́𝐃𝐀",
        `💸 Você enviou ${formatCoins(amount)} XC$ para @${String(targetJid).split("@")[0]}
💳 Seu novo saldo foi atualizado.
🪙 Saldo do destino: ${formatCoins(targetEco.coins)} XC$`,
      ),
      mentions: [targetJid],
    });
  },
};