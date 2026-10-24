import { generateWAMessageFromContent, proto } from "baileys";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PREFIX } from "../../../config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, "../../../assets/markup/tictactoe.html");
const HTML_PRIMITIVE_TYPE = "GenAIaeacdsnwHtmlPrimitive";

export default {
  name: "tictactoe",
  description: "Abre o jogo da velha interativo Xapa.",
  commands: ["tictactoe", "ttt", "velha"],
  usage: `${PREFIX}velha`,

  handle: async ({ socket, remoteJid, webMessage }) => {
    let html;

    try {
      html = await import("node:fs/promises").then(({ readFile }) =>
        readFile(htmlPath, "utf8"),
      );
    } catch (error) {
      throw new Error(`Não foi possível carregar o jogo HTML: ${error.message}`);
    }

    const responseId = `xapa-tictactoe-${Date.now()}-${randomBytes(6).toString("hex")}`;
    const richResponse = {
      messageType: 1,
      submessages: [{
        messageType: 2,
        messageText: "⛓️ JOGO DA VELHA XAPA. Toque no tabuleiro para jogar contra o bot.",
      }],
      unifiedResponse: {
        data: Buffer.from(JSON.stringify({
          response_id: responseId,
          sections: [{
            view_model: {
              primitive: {
                payload: html,
                trusted_sources: [],
                __typename: HTML_PRIMITIVE_TYPE,
              },
              __typename: "GenAISingleLayoutViewModel",
            },
          }],
        })).toString("base64"),
      },
      contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" },
        forwardOrigin: 4,
      },
    };

    const payload = proto.Message.fromObject({
      botForwardedMessage: {
        message: { richResponseMessage: richResponse },
      },
      messageContextInfo: {
        messageSecret: randomBytes(32),
        botMetadata: {
          modelMetadata: {
            modelType: "LLAMA_PROD",
            premiumModelStatus: "AVAILABLE",
          },
          botAgeCollectionMetadata: {},
          botResponseId: responseId,
          verificationMetadata: { proofs: [] },
          botInfrastructureDiagnostics: {},
          capabilityMetadata: {
            capabilities: [
              "RICH_RESPONSE_STRUCTURED_RESPONSE",
              "RICH_RESPONSE_UNIFIED_RESPONSE",
              "RICH_RESPONSE_UNIFIED_HTML_COMPONENT",
              "SESSION_TRANSPARENCY_SYSTEM_MESSAGE",
            ],
          },
        },
      },
    });

    const outgoingMessage = generateWAMessageFromContent(remoteJid, payload, {
      quoted: JSON.parse(JSON.stringify(webMessage)),
    });

    return socket.relayMessage(remoteJid, outgoingMessage.message, {
      messageId: outgoingMessage.key.id,
    });
  },
};