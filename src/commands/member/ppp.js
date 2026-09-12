import { PREFIX } from "../../config.js";
import { registerPppPoll } from "../../events/ppp-poll.js";

export default {
  name: "ppp",
  description: "Pego, penso, passo",
  commands: ["ppp"],
  usage: `${PREFIX}ppp`,

  handle: async ({ socket, remoteJid, sendPoll }) => {
    await socket.groupSettingUpdate(remoteJid, "announcement");

    const pollMessage = await sendPoll(
      "╭━━━〔 🎯🔥 𝐏𝐏𝐏 🔥🎯 〕━━━╮\n┃ 🃏 𝐏𝐄𝐆𝐎 • 𝐏𝐄𝐍𝐒𝐎 • 𝐏𝐀𝐒𝐒𝐎\n┃ 👀 Quem vai participar?\n╰━━━━━━━━━━━━━━━━━━━━━━╯",
      [
        { optionName: "✅ Vou participar 😈" },
        { optionName: "❌ Não vou participar 🙅" },
      ],
      true
    );

    registerPppPoll(pollMessage, socket);
  },
};