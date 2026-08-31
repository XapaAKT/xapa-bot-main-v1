import { createRequire } from "node:module";
import { generateWAMessageContent, generateWAMessageFromContent, proto } from "baileys";

const require = createRequire(import.meta.url);
const { sendButtons } = require("baileys_helper");

export async function sendInteractiveButtons(sock, jid, data) {
  return sendButtons(sock, jid, data);
}

export async function sendInteractiveImageButtons(sock, jid, data) {
  const response = await fetch(data.imageUrl, {
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`Não foi possível carregar a capa: HTTP ${response.status}`);
  }

  const imageContent = await generateWAMessageContent(
    { image: Buffer.from(await response.arrayBuffer()) },
    { upload: sock.waUploadToServer.bind(sock) },
  );

  const interactiveMessage = proto.Message.InteractiveMessage.create({
    body: proto.Message.InteractiveMessage.Body.create({ text: data.text }),
    footer: proto.Message.InteractiveMessage.Footer.create({
      text: data.footer || "",
    }),
    header: proto.Message.InteractiveMessage.Header.create({
      title: data.title || "",
      hasMediaAttachment: true,
      imageMessage: imageContent.imageMessage,
    }),
    nativeFlowMessage:
      proto.Message.InteractiveMessage.NativeFlowMessage.create({
        buttons: data.buttons.map((button) => ({
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: button.text,
            id: button.id,
          }),
        })),
      }),
  });

  const message = generateWAMessageFromContent(
    jid,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage,
        },
      },
    },
    { userJid: sock.user?.id, timestamp: new Date() },
  );

  await sock.relayMessage(jid, message.message, {
    messageId: message.key.id,
  });
}