import { createRequire } from "node:module";
import fs from "node:fs";
import { generateWAMessageContent, generateWAMessageFromContent, proto } from "baileys";

const require = createRequire(import.meta.url);
const { sendButtons, sendInteractiveMessage } = require("baileys_helper");

const NATIVE_FLOW_BUTTON_NAMES = new Set([
  "quick_reply",
  "cta_url",
  "cta_copy",
  "cta_call",
  "cta_catalog",
  "cta_reminder",
  "cta_cancel_reminder",
  "address_message",
  "send_location",
  "open_webview",
  "mpm",
  "wa_payment_transaction_details",
  "automated_greeting_message_view_catalog",
  "galaxy_message",
  "single_select",
  "call_permission_request",
  "review_and_pay",
  "payment_info",
]);

export function createNativeFlowButton(name, parameters) {
  if (!NATIVE_FLOW_BUTTON_NAMES.has(name)) {
    throw new Error(`Tipo de botão nativo não suportado: ${name}`);
  }

  if (!parameters || typeof parameters !== "object" || Array.isArray(parameters)) {
    throw new TypeError("Os parâmetros do botão devem ser um objeto.");
  }

  return {
    name,
    buttonParamsJson: JSON.stringify(parameters),
  };
}

export async function sendInteractiveButtons(sock, jid, data) {
  return sendButtons(sock, jid, data);
}

export async function sendNativeFlowButtons(sock, jid, data, options = {}) {
  if (!Array.isArray(data?.buttons) || data.buttons.length === 0) {
    throw new TypeError("Informe ao menos um botão interativo.");
  }

  const buttons = data.buttons.map((button) => {
    if (!NATIVE_FLOW_BUTTON_NAMES.has(button?.name)) {
      throw new Error(`Tipo de botão nativo não suportado: ${button?.name}`);
    }

    if (typeof button.buttonParamsJson !== "string") {
      throw new TypeError(
        `buttonParamsJson deve ser texto para o botão ${button.name}.`,
      );
    }

    JSON.parse(button.buttonParamsJson);
    return button;
  });

  const interactiveMessage = {
    nativeFlowMessage: { buttons },
  };

  if (data.videoPath) {
    const videoContent = await generateWAMessageContent(
      { video: fs.readFileSync(data.videoPath), gifPlayback: true },
      { upload: sock.waUploadToServer.bind(sock) },
    );

    interactiveMessage.header = {
      title: data.title || "",
      hasMediaAttachment: true,
      videoMessage: videoContent.videoMessage,
    };
  } else if (data.title) {
    interactiveMessage.header = { title: data.title };
  }
  if (data.text) {
    interactiveMessage.body = { text: data.text };
  }
  if (data.footer) {
    interactiveMessage.footer = { text: data.footer };
  }

  return sendInteractiveMessage(
    sock,
    jid,
    { interactiveMessage },
    options,
  );
}

export async function sendInteractiveGifButtons(sock, jid, data) {
  const videoContent = await generateWAMessageContent(
    { video: fs.readFileSync(data.videoPath), gifPlayback: true },
    { upload: sock.waUploadToServer.bind(sock) },
  );

  const buttonsMessage = proto.Message.ButtonsMessage.create({
    contentText: data.text,
    footerText: data.footer || "",
    headerType: proto.Message.ButtonsMessage.HeaderType.VIDEO,
    videoMessage: videoContent.videoMessage,
    buttons: data.buttons.map((button) => ({
      buttonId: button.id,
      buttonText: { displayText: button.text },
      type: proto.Message.ButtonsMessage.Button.Type.RESPONSE,
    })),
  });

  return sendInteractiveMessage(sock, jid, {
    buttonsMessage,
  });
}

const CAROUSEL_NODES = [
  {
    tag: "biz",
    attrs: {},
    content: [
      {
        tag: "interactive",
        attrs: { type: "native_flow", v: "1" },
        content: [
          {
            tag: "native_flow",
            attrs: { v: "9", name: "mixed" },
          },
        ],
      },
    ],
  },
];

export async function sendInteractiveCarousel(sock, jid, data, options = {}) {
  if (!Array.isArray(data?.cards) || data.cards.length < 1) {
    throw new TypeError("O carrossel precisa de pelo menos um card.");
  }
  const {
    includeMessageContextInfo = true,
    includeCarouselNodes = true,
    viewOnce = true,
  } = options;

  const cards = await Promise.all(
    data.cards.map(async (card) => {
      if (!card?.text) {
        throw new TypeError("Cada card do carrossel precisa de texto.");
      }

      let header = card.title ? { title: card.title } : undefined;
      if (card.imagePath || card.imageUrl || card.videoPath) {
        let image;

        if (card.imagePath) {
          image = fs.readFileSync(card.imagePath);
        } else if (card.imageUrl) {
          const response = await fetch(card.imageUrl, {
            signal: AbortSignal.timeout(15000),
          });
          if (!response.ok) {
            throw new Error(
              `Não foi possível carregar a capa do carrossel: HTTP ${response.status}`,
            );
          }
          image = Buffer.from(await response.arrayBuffer());
        }

        const media = card.videoPath
          ? {
              video: fs.readFileSync(card.videoPath),
              gifPlayback: true,
            }
          : { image };
        const mediaContent = await generateWAMessageContent(media, {
          upload: sock.waUploadToServer.bind(sock),
        });

        header = {
          ...header,
          hasMediaAttachment: true,
          ...(card.videoPath
            ? { videoMessage: mediaContent.videoMessage }
            : { imageMessage: mediaContent.imageMessage }),
        };
      }

      return proto.Message.InteractiveMessage.create({
        ...(header && {
          header: proto.Message.InteractiveMessage.Header.create(header),
        }),
        body: proto.Message.InteractiveMessage.Body.create({
          text: card.text,
        }),
        ...(card.footer && {
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: card.footer,
          }),
        }),
        nativeFlowMessage:
          proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: card.nativeFlowButtons || (card.buttons || []).map((button) => ({
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: button.text,
                id: button.id,
              }),
            })),
          }),
      });
    }),
  );

  const innerMessage = {
    ...(includeMessageContextInfo && {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
      },
    }),
    interactiveMessage: proto.Message.InteractiveMessage.create({
      body: proto.Message.InteractiveMessage.Body.create({
        text: data.text,
      }),
      ...(data.footer && {
        footer: proto.Message.InteractiveMessage.Footer.create({
          text: data.footer,
        }),
      }),
      carouselMessage:
        proto.Message.InteractiveMessage.CarouselMessage.create({
          messageVersion: 1,
          carouselCardType:
            proto.Message.InteractiveMessage.CarouselMessage
              .CarouselCardType.HSCROLL_CARDS,
          cards,
        }),
    }),
  };
  const messageContent = viewOnce
    ? { viewOnceMessage: { message: innerMessage } }
    : innerMessage;

  const message = generateWAMessageFromContent(jid, messageContent, {
    userJid: sock.user?.id,
    quoted: options.quoted,
    timestamp: new Date(),
  });

  await sock.relayMessage(jid, message.message, {
    messageId: message.key.id,
    ...(includeCarouselNodes && { additionalNodes: CAROUSEL_NODES }),
  });

  return message;
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