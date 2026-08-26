import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { gemini } from "../../../services/tokito.js";

export default {
  name: "gemini",
  description: "Conversa com o Gemini através da Tokito APIs.",
  commands: ["gemini"],
  usage: `${PREFIX}gemini sua pergunta`,

  handle: async ({
    args,
    sendReply,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReact,
    sendErrorReply,
  }) => {
    if (!args?.length) {
      throw new InvalidParameterError(
        `Uso: ${PREFIX}gemini sua pergunta\n\nExemplo:\n${PREFIX}gemini quem é o Batman?`
      );
    }

    const pergunta = args.join(" ").trim();

    await sendWaitReact();

    try {
      const resposta = await gemini(pergunta);

      if (!resposta) {
        throw new Error(
          "A Tokito não retornou nenhuma resposta."
        );
      }

      await sendReply(
        `╭─❏ 🧠 *TOKITO • GEMINI*
│
${resposta}
│
╰───────────────❏`
      );

      await sendSuccessReact();

    } catch (error) {
      console.error(
        "[GEMINI ERROR]",
        error
      );

      await sendErrorReact();

      await sendErrorReply(
        `❌ Erro ao falar com o Gemini.\n\n${error.message}`
      );
    }
  },
};