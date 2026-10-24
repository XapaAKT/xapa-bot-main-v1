import { inspect } from "node:util";
import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import { errorLog } from "../../utils/logger.js";

export default {
  name: "raw2",
  description:
    "Exibe no terminal os dados brutos da mensagem atual ou da mensagem respondida.",
  commands: ["raw2"],
  usage: `${PREFIX}raw2 (ou responda uma mensagem)`,

  handle: async ({ webMessage, sendSuccessReply }) => {
    try {
      const contextInfo =
        webMessage?.message?.extendedTextMessage?.contextInfo;
      const quotedMessage = contextInfo?.quotedMessage;
      const rawMessage = quotedMessage
        ? {
            key: {
              remoteJid: webMessage.key?.remoteJid,
              participant: contextInfo.participant,
              id: contextInfo.stanzaId,
            },
            messageTimestamp: contextInfo.quotedMessageTimestamp,
            pushName: contextInfo.pushName,
            message: quotedMessage,
          }
        : webMessage;

      console.log(
        `[RAW2] ${quotedMessage ? "Mensagem respondida" : "Mensagem atual"}`,
      );
      console.log(
        inspect(rawMessage, {
          colors: Boolean(process.stdout.isTTY),
          depth: 8,
          maxArrayLength: 100,
        }),
      );

      await sendSuccessReply(
        `Dados brutos exibidos no terminal. ${
          quotedMessage ? "Mensagem respondida." : "Mensagem do comando."
        }`,
      );
    } catch (error) {
      errorLog(`[RAW2] Falha ao exibir mensagem: ${error?.stack || error}`);
      throw new WarningError(
        "Não foi possível exibir os dados brutos. Confira o log do terminal.",
      );
    }
  },
};
