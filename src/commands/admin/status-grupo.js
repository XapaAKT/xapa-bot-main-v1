import { randomBytes } from "node:crypto";
import {
  downloadMediaMessage,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto,
} from "baileys";
import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";

const MEDIA_TYPES = ["image", "video", "audio"];
const CLOSE_FRIENDS =
  proto.ContextInfo.StatusAudienceMetadata.AudienceType.CLOSE_FRIENDS;

function unwrapMessage(message) {
  let content = message;

  while (content) {
    const wrapper =
      content.ephemeralMessage ||
      content.viewOnceMessage ||
      content.viewOnceMessageV2 ||
      content.documentWithCaptionMessage;

    if (!wrapper?.message) {
      return content;
    }

    content = wrapper.message;
  }

  return {};
}

function getQuotedMedia(webMessage, botJid) {
  const sourceMessage = webMessage?.message || {};
  const message = unwrapMessage(sourceMessage);
  const contextInfo = Object.values(message).find(
    (content) => content?.contextInfo?.quotedMessage,
  )?.contextInfo;
  const quotedSourceMessage = contextInfo?.quotedMessage || {};
  const quotedMessage = unwrapMessage(quotedSourceMessage);

  for (const type of MEDIA_TYPES) {
    const directMedia = message[`${type}Message`];
    const quotedMedia = quotedMessage[`${type}Message`];
    const media = directMedia || quotedMedia;

    if (media) {
      return {
        type,
        data: media,
        key: directMedia
          ? webMessage.key
          : {
              remoteJid: webMessage.key?.remoteJid,
              participant: contextInfo?.participant,
              id: contextInfo?.stanzaId,
              fromMe:
                contextInfo?.participant?.split(":")[0] ===
                botJid?.split(":")[0],
            },
        sourceMessage: directMedia ? sourceMessage : quotedSourceMessage,
      };
    }
  }

  return null;
}

async function relayGroupStatus({ socket, remoteJid, content, messageSecret }) {
  const generatedMessage = generateWAMessageFromContent(
    remoteJid,
    {
      messageContextInfo: { messageSecret },
      groupStatusMessageV2: {
        message: {
          ...content,
          messageContextInfo: { messageSecret },
        },
      },
    },
    {
      userJid: socket.user?.id,
      timestamp: new Date(),
    },
  );

  await socket.relayMessage(remoteJid, generatedMessage.message, {
    messageId: generatedMessage.key.id,
  });
}

export default {
  name: "status-grupo",
  description:
    "Publica texto ou mídia respondida no status do grupo para amigos próximos.",
  commands: ["status-grupo", "statusgrupo"],
  usage: `${PREFIX}status-grupo <mensagem> ou responda a uma imagem, vídeo ou áudio`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    fullArgs,
    isGroup,
    remoteJid,
    socket,
    webMessage,
    sendSuccessReply,
  }) => {
    if (!isGroup) {
      throw new WarningError("Este comando só pode ser usado em grupos.");
    }

    const text = (fullArgs || "").trim();
    const media = getQuotedMedia(webMessage, socket.user?.id);

    if (!media && !text) {
      throw new InvalidParameterError(
        `Envie um texto ou responda a uma imagem, vídeo ou áudio com ${PREFIX}status-grupo.`,
      );
    }

    const messageSecret = randomBytes(32);
    const contextInfo = {
      isGroupStatus: true,
      statusAudienceMetadata: {
        audienceType: CLOSE_FRIENDS,
      },
    };

    if (!media) {
      await relayGroupStatus({
        socket,
        remoteJid,
        messageSecret,
        content: {
          extendedTextMessage: {
            text,
            contextInfo,
          },
        },
      });

      await sendSuccessReply(
        "Status de texto enviado ao grupo com público de amigos próximos.",
      );
      return;
    }

    const fakeMessage = {
      key: media.key,
      message: media.sourceMessage,
    };
    const buffer = await downloadMediaMessage(
      fakeMessage,
      "buffer",
      {},
      {
        logger: socket.logger,
        reuploadRequest: socket.updateMediaMessage.bind(socket),
      },
    );

    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new WarningError("Não foi possível baixar a mídia respondida.");
    }

    const mediaContent = { [media.type]: buffer };
    if (media.type === "audio") {
      mediaContent.mimetype = media.data.mimetype || "audio/mp4";
    }

    const preparedMedia = await prepareWAMessageMedia(mediaContent, {
      upload: socket.waUploadToServer.bind(socket),
    });
    const mediaMessage = preparedMedia[`${media.type}Message`];

    if (!mediaMessage) {
      throw new WarningError("Não foi possível preparar a mídia para o status.");
    }

    await relayGroupStatus({
      socket,
      remoteJid,
      messageSecret,
      content: {
        [`${media.type}Message`]: {
          ...mediaMessage,
          ...(media.type !== "audio" && text ? { caption: text } : {}),
          contextInfo,
        },
      },
    });

    const mediaLabel = {
      image: "imagem",
      video: "vídeo",
      audio: "áudio",
    }[media.type];

    await sendSuccessReply(
      `Status de ${mediaLabel} enviado ao grupo com público de amigos próximos.`,
    );
  },
};
