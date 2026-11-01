import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

const MAP = {
  "24h": 86400,
  "24": 86400,
  "7d": 604800,
  "7": 604800,
  "90d": 7776000,
  "90": 7776000,
};

export default {
  name: "mensagem-efemera",
  description: "Mensagem que o próprio WhatsApp apaga sozinho.",
  commands: ["mensagem-efemera", "msg-efemera", "msg-sumir"],
  usage: `${PREFIX}msg-efemera [24h|7d|90d] <mensagem>`,
  handle: async ({ args, replyText, socket, remoteJid }) => {
    const first = args?.[0]?.toLowerCase();
    const expiration = MAP[first] || 86400; // padrão 24h

    const message = (MAP[first] ? args.slice(1) : args).join(" ").trim() || replyText?.trim();

    if (!message) {
      throw new InvalidParameterError(
        `Informe a mensagem. Exemplo: ${PREFIX}msg-efemera 24h Esta mensagem vai sumir em 24h.`,
      );
    }

    await socket.sendMessage(remoteJid, {
      text: message, // sem "⏳" pra não ficar rastro quando sumir
      ephemeralExpiration: expiration,
    });
  },
};