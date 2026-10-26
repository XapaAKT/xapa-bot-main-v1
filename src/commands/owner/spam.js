import fs from "node:fs/promises";

import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import {
  download,
  getContent,
  getRandomName,
  removeFileIfExists,
} from "../../utils/index.js";

const MAX_MESSAGES = 250;
const MESSAGE_INTERVAL_MS = 350;

function getContextInfo(message) {
  const candidates = [
    message?.extendedTextMessage?.contextInfo,
    message?.imageMessage?.contextInfo,
    message?.videoMessage?.contextInfo,
    message?.audioMessage?.contextInfo,
    message?.documentMessage?.contextInfo,
    message?.stickerMessage?.contextInfo,
  ];

  const contextInfo = candidates.find(Boolean);
  if (contextInfo) return contextInfo;

  const wrappedMessage =
    message?.ephemeralMessage?.message ||
    message?.viewOnceMessage?.message ||
    message?.viewOnceMessageV2?.message;

  return wrappedMessage ? getContextInfo(wrappedMessage) : null;
}

function unwrapMessage(message) {
  return (
    message?.ephemeralMessage?.message ||
    message?.viewOnceMessage?.message ||
    message?.viewOnceMessageV2?.message ||
    message
  );
}

function getQuotedContent(quotedMessage) {
  const message = unwrapMessage(quotedMessage);
  const mediaTypes = ["image", "video", "audio", "sticker", "document"];

  for (const type of mediaTypes) {
    const content = getContent({ message }, type);
    if (content) return { type, content };
  }

  return null;
}

function getQuotedText(quotedMessage) {
  const message = unwrapMessage(quotedMessage);

  return (
    message?.conversation ||
    message?.extendedTextMessage?.text ||
    message?.imageMessage?.caption ||
    message?.videoMessage?.caption ||
    message?.documentMessage?.caption ||
    ""
  );
}

function parseRequest(fullArgs) {
  const match = fullArgs.match(/^(.*?)(?:\s*\/\s*|\s+)(\d+)\s*$/);
  if (!match) {
    return { text: fullArgs.trim(), count: 10 };
  }

  return {
    text: match[1].trim(),
    count: Math.max(1, Math.min(Number(match[2]), MAX_MESSAGES)),
  };
}

async function loadQuotedMedia(quotedMessage, mediaType) {
  const extensions = {
    image: "png",
    video: "mp4",
    audio: "mpeg",
    sticker: "webp",
    document: "bin",
  };
  const extension = extensions[mediaType];
  const mediaWebMessage = { message: unwrapMessage(quotedMessage) };
  const filePath = await download(
    mediaWebMessage,
    getRandomName(extension),
    mediaType,
    extension,
  );

  if (!filePath) {
    throw new WarningError("Não consegui baixar a mídia da mensagem respondida.");
  }

  try {
    return await fs.readFile(filePath);
  } finally {
    await removeFileIfExists(filePath);
  }
}

async function sendRepeatedMessage({
  senders,
  media,
  text,
  count,
}) {
  for (let index = 0; index < count; index++) {
    if (!media) {
      await senders.sendText(text);
    } else {
      const caption = media.content.caption || "";

      switch (media.type) {
        case "image":
          await senders.sendImageFromBuffer(media.buffer, caption, null, false);
          break;
        case "video":
          await senders.sendVideoFromBuffer(media.buffer, caption, null, false);
          break;
        case "audio":
          await senders.sendAudioFromBuffer(media.buffer, false, false);
          break;
        case "sticker":
          await senders.sendStickerFromBuffer(media.buffer, false);
          break;
        case "document":
          await senders.sendDocumentFromBuffer(
            media.buffer,
            media.content.mimetype,
            media.content.fileName || "arquivo",
            false,
          );
          break;
        default:
          throw new WarningError(`Tipo de mídia não suportado: ${media.type}`);
      }
    }

    if (index < count - 1) {
      await new Promise((resolve) => setTimeout(resolve, MESSAGE_INTERVAL_MS));
    }
  }
}

export default {
  name: "spam",
  description: "Repete uma mensagem de texto ou mídia no grupo (até 100 vezes).",
  commands: ["spam", "spamar"],
  usage: `${PREFIX}spam <texto> / <quantidade> ou responda uma mensagem`,

  handle: async ({
    fullArgs,
    isGroup,
    webMessage,
    sendAudioFromBuffer,
    sendDocumentFromBuffer,
    sendImageFromBuffer,
    sendReply,
    sendStickerFromBuffer,
    sendSuccessReply,
    sendText,
    sendVideoFromBuffer,
  }) => {
    if (!isGroup) {
      throw new WarningError("Este comando só pode ser usado em grupos.");
    }

    const { text, count } = parseRequest(fullArgs);
    const quotedMessage = getContextInfo(webMessage?.message)?.quotedMessage;
    const quotedContent = quotedMessage
      ? getQuotedContent(quotedMessage)
      : null;

    let media = null;
    if (quotedContent) {
      media = {
        ...quotedContent,
        buffer: await loadQuotedMedia(quotedMessage, quotedContent.type),
      };
    }

    const textToSend = text || (quotedMessage ? getQuotedText(quotedMessage) : "");
    if (!media && !textToSend) {
      throw new WarningError(
        `Informe um texto ou responda uma mensagem.\nExemplo: ${PREFIX}spam Olá / 5`,
      );
    }

    const senders = {
      sendAudioFromBuffer,
      sendDocumentFromBuffer,
      sendImageFromBuffer,
      sendStickerFromBuffer,
      sendText,
      sendVideoFromBuffer,
    };

    await sendReply(
      `Iniciando: ${count} envio(s). O limite é ${MAX_MESSAGES} mensagens.`,
    );
    await sendRepeatedMessage({
      senders,
      media,
      text: textToSend,
      count,
    });
    await sendSuccessReply(
      `Concluído: ${count} mensagem(ns) enviada(s).`,
    );
  },
};
