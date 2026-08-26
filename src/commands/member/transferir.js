import { PREFIX } from "../../config.js";
import {
  formatCoins,
  extractMentionedJids,
  getQuotedParticipant,
  getUserEconomy,
  updateUserEconomy,
} from "../../utils/economy.js";
import { getUserName, onlyNumbers } from "../../utils/index.js";

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
      return sendReply(`
╭━━━〔 💸 TRANSFERIR 〕━━━╮

Uso:
${PREFIX}transferir <quantia> @membro

Exemplo:
${PREFIX}transferir 500 @usuario

╰━━━━━━━━━━━━━━━━━━━━━━╯
`);
    }

    if (!targetJid) {
      return sendReply(`
╭━━━〔 💸 TRANSFERIR 〕━━━╮

Você precisa marcar alguém ou responder uma mensagem.

Exemplo:
${PREFIX}transferir 500 @usuario

╰━━━━━━━━━━━━━━━━━━━━━━╯
`);
    }

    if (String(targetJid) === String(userLid)) {
      return sendReply("Você não pode transferir moedas para você mesmo.");
    }

    if (senderEco.coins < amount) {
      return sendReply(`
╭━━━〔 💸 TRANSFERIR 〕━━━╮

Saldo insuficiente.

Seu saldo: ${formatCoins(senderEco.coins)} XC$

╰━━━━━━━━━━━━━━━━━━━━━━╯
`);
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
      text: `
╭━━━〔 💸 TRANSFERÊNCIA 〕━━━╮

✅ Você enviou ${formatCoins(amount)} XC$ para @${String(targetJid).split("@")[0]}

💳 Seu novo saldo foi atualizado.
💳 Saldo do destino: ${formatCoins(targetEco.coins)} XC$

╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`,
      mentions: [targetJid],
    });
  },
};