import { PREFIX } from "../../config.js";
import { extractMentionedJids } from "../../utils/economy.js";

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default {
  name: "ppp",
  description: "Pego, penso, passo",
  commands: ["ppp"],
  usage: `${PREFIX}ppp @a @b @c`,

  handle: async ({ sendReply, sendSuccessReact, webMessage, socket, remoteJid }) => {
    const mentions = [...new Set(extractMentionedJids(webMessage))].slice(0, 3);

    if (mentions.length < 3) {
      return sendReply(`
╭━━━〔 🎯 PPP 〕━━━╮

Marque 3 pessoas para usar o comando.

Exemplo:
${PREFIX}ppp @a @b @c

╰━━━━━━━━━━━━━━━━╯
`);
    }

    const people = shuffle(mentions);
    const roles = ["🥇 PEGO", "🥈 PENSO", "🥉 PASSO"];

    const result = roles
      .map((role, index) => `${role} :: @${people[index].split("@")[0]}`)
      .join("\n");

    await sendSuccessReact();

    await socket.sendMessage(remoteJid, {
      text: `
╭━━━〔 🎯 PPP 〕━━━╮

${result}

╰━━━━━━━━━━━━━━━━╯
`,
      mentions: people,
    });
  },
};