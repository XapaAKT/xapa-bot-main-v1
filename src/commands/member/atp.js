import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { attp } from "../../services/tokito.js";

export default {
  name: "atp",
  description: "Gera uma figurinha ATTP.",
  commands: ["atp", "attp"],
  usage: `${PREFIX}atp texto`,

  handle: async ({
    args,
    sendReply,
    sendImageFromURL,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReact,
    sendErrorReply,
  }) => {
    if (!args?.length) {
      throw new InvalidParameterError(
        `Uso: ${PREFIX}atp XAPA IN CHAINS`
      );
    }

    const text = args.join(" ").trim();

    await sendWaitReact();

    try {
      const data = await attp(text);

      if (!data?.arquivo) {
        throw new Error(
          "A Tokito não retornou o arquivo do ATTP."
        );
      }

      await sendImageFromURL(
        data.arquivo,
        `⛓️ *XAPA ATTP*\n\nTexto: ${text}`
      );

      await sendSuccessReact();
    } catch (error) {
      console.error("[ATTP ERROR]", error);

      await sendErrorReact();

      await sendErrorReply(
        `❌ Não consegui gerar o ATTP.\n\n${error.message}`
      );
    }
  },
};