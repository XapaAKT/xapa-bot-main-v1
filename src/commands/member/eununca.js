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
      `╭━━━〔 🥀✨ 𝐄𝐔 𝐍𝐔𝐍𝐂𝐀 ✨🥀 〕━━━╮\n┃ 💬 ${frase}\n╰━━━━━━━━━━━━━━━━━━━━━━╯`,
      [{ optionName: "✅ Eu já 😈" }, { optionName: "🙅 Eu nunca 👀" }],
      true
    );
  },
};