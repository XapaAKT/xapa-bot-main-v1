import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

export default {
  name: "eununca",
  description: "Eu nunca...",
  commands: ["eununca", "eu-nunca"],
  usage: `${PREFIX}eununca <frase>`,

  handle: async ({ fullArgs, sendPoll }) => {
    const frase = fullArgs?.trim();

    if (!frase) {
      throw new InvalidParameterError(
        `Use assim: ${PREFIX}eununca dei o rabo para três pessoas na mesma semana`
      );
    }

    await sendPoll(
      `╭━━━〔 🥀✨ 𝐄𝐔 𝐍𝐔𝐍𝐂𝐀 ✨🥀 〕━━━╮
┃
┃ 💬 𝐄𝐮 𝐧𝐮𝐧𝐜𝐚: ${frase}
┃
╰━━━〔 🗳️ 𝐕𝐎𝐓𝐄 𝐒𝐄𝐌 𝐌𝐄𝐃𝐎 〕━━━╯`,
      [{ optionName: "✅ Eu já 😈" }, { optionName: "🙅 Eu nunca 👀" }],
      true
    );
  },
};