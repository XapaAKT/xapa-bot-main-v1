import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { searchPinterest } from "../../../services/pinterest-scraper.js";
import { errorLog } from "../../../utils/logger.js";
import {
  generateWAMessageContent,
  generateWAMessageFromContent,
  proto,
} from "baileys";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const PINTEREST_FOOTER = "Pinterest";
const CAROUSEL_NODE = [
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

export default {
  name: "pinterest",
  description: "Busco imagens no Pinterest e envio em formato carrossel.",
  commands: ["pinterest", "pin"],
  usage: `${PREFIX}pinterest gatos fofos`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
    sendImageFromBuffer,
    socket,
    remoteJid,
    webMessage,
  }) => {
    if (!fullArgs.length) {
      throw new InvalidParameterError(
        "Você precisa me dizer o que deseja buscar no Pinterest!",
      );
    }

    await sendWaitReact();

    try {
      const images = await searchPinterest(fullArgs.trim());

      if (!images.length) {
        await sendErrorReply(
          "Não foi possível montar o carrossel com as imagens retornadas.",
        );
        return;
      }

      await sendPinterestCarousel({
        socket,
        remoteJid,
        webMessage,
        images,
        query: fullArgs.trim(),
        sendImageFromBuffer,
      });
      await sendSuccessReact();
    } catch (error) {
      errorLog(error.stack || error.message);
      await sendErrorReply(
        `Não consegui montar o carrossel do Pinterest.\n\n${error.message}`,
      );
    }
  },
};

async function sendPinterestCarousel({
  socket,
  remoteJid,
  webMessage,
  images,
  query,
  sendImageFromBuffer,
}) {
  const cards = [];
  let fallbackImage;

  for (const imageUrl of images) {
    let image;
    try {
      image = await downloadPinterestImage(imageUrl);
    } catch (error) {
      errorLog(`Pinterest: imagem ignorada (${error.message})`);
      continue;
    }

    fallbackImage ||= image;
    const imageContent = await generateWAMessageContent(
      { image },
      { upload: socket.waUploadToServer.bind(socket) },
    );

    cards.push(
      proto.Message.InteractiveMessage.create({
        header: proto.Message.InteractiveMessage.Header.create({
          hasMediaAttachment: true,
          imageMessage: imageContent.imageMessage,
        }),
        body: proto.Message.InteractiveMessage.Body.create({
          text: `Imagem ${cards.length + 1}`,
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({
          text: PINTEREST_FOOTER,
        }),
        nativeFlowMessage:
          proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [],
          }),
      }),
    );
  }

  if (!cards.length) {
    throw new Error(
      "O Pinterest não disponibilizou nenhuma imagem que possa ser enviada.",
    );
  }

  if (cards.length === 1) {
    await sendImageFromBuffer(
      fallbackImage,
      `📌 Pinterest: ${query}`,
    );
    return;
  }

  const message = generateWAMessageFromContent(
    remoteJid,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `📌 Resultados do Pinterest para: ${query}
              > BY CREATOR CHOSSO BOT`,
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: "Deslize para ver mais imagens.",
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
        },
      },
    },
    {
      userJid: socket.user?.id,
      quoted: webMessage,
      timestamp: new Date(),
    },
  );

  await socket.relayMessage(remoteJid, message.message, {
    messageId: message.key.id,
    additionalNodes: CAROUSEL_NODE,
  });
}

async function downloadPinterestImage(imageUrl) {
  const url = new URL(imageUrl);
  if (
    url.protocol !== "https:" ||
    (url.hostname !== "i.pinimg.com" && !url.hostname.endsWith(".pinimg.com"))
  ) {
    throw new Error("O Pinterest retornou uma URL de imagem inválida.");
  }

  const response = await fetch(url, {
    headers: {
      accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      referer: "https://www.pinterest.com/",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Não foi possível baixar uma imagem do Pinterest: HTTP ${response.status}.`);
  }

  const finalUrl = new URL(response.url);
  if (
    finalUrl.protocol !== "https:" ||
    (finalUrl.hostname !== "i.pinimg.com" && !finalUrl.hostname.endsWith(".pinimg.com"))
  ) {
    throw new Error("O Pinterest redirecionou para um domínio de imagem inválido.");
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    throw new Error("O Pinterest retornou um arquivo que não é uma imagem.");
  }

  const contentLength = Number(response.headers.get("content-length"));
  if (contentLength > MAX_IMAGE_SIZE) {
    throw new Error("Uma imagem do Pinterest excedeu o limite de 10 MB.");
  }

  const chunks = [];
  let downloadedSize = 0;
  if (!response.body) {
    throw new Error("A resposta do Pinterest não contém dados da imagem.");
  }

  for await (const chunk of response.body) {
    downloadedSize += chunk.length;
    if (downloadedSize > MAX_IMAGE_SIZE) {
      throw new Error("Uma imagem do Pinterest excedeu o limite de 10 MB.");
    }
    chunks.push(chunk);
  }

  if (!downloadedSize) {
    throw new Error("O Pinterest retornou uma imagem vazia.");
  }

  return Buffer.concat(chunks, downloadedSize);
}
