import { generateWAMessageFromContent, proto } from "baileys";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { PREFIX } from "../../../config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, "../../../assets/markup/hell_runner.html");
const HTML_PRIMITIVE_TYPE = "GenAIaeacdsnwHtmlPrimitive";

export default {
  name: "dinossauro",
  description: "Abre o jogo runner interativo no WhatsApp.",
  commands: ["dinossauro", "dino", "hellrunner"],
  usage: `${PREFIX}dinossauro`,

  handle: async ({ socket, remoteJid, webMessage }) => {
    let html;

    try {
      html = await readFile(htmlPath, "utf8");
    } catch (error) {
      throw new Error(`Não foi possível carregar o jogo HTML: ${error.message}`);
    }

    const responseId = `xapa-dinossauro-${Date.now()}-${randomBytes(6).toString("hex")}`;
    const richResponse = {
      messageType: 1,
      submessages: [{
        messageType: 2,
        messageText: "🦖 JOGO DO DINOSSAURO XAPA. Toque no jogo para começar e pular os obstáculos.",
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
