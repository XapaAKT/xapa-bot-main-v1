import sharp from "sharp";
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { errorLog } from "../../utils/logger.js";
import { getRememberedParticipantName } from "../../utils/participantNames.js";

const WIDTH = 800;
const HEIGHT = 450;
const PHOTO_WIDTH = 440;
const PHOTO_FADE_WIDTH = 180;
const MAX_QUOTE_LINES = 7;

function normalizeJid(jid) {
  return typeof jid === "string" ? jid.replace(/:\d+(?=@)/g, "").trim() : "";
}

function getMessageContextInfo(message) {
  let content = message;

  for (let depth = 0; content && depth < 5; depth += 1) {
    const contextInfo =
      content.extendedTextMessage?.contextInfo ||
      content.imageMessage?.contextInfo ||
      content.videoMessage?.contextInfo ||
      content.documentMessage?.contextInfo ||
      content.audioMessage?.contextInfo ||
      content.stickerMessage?.contextInfo;

    if (contextInfo) return contextInfo;

    content =
      content.ephemeralMessage?.message ||
      content.viewOnceMessage?.message ||
      content.viewOnceMessageV2?.message ||
      content.documentWithCaptionMessage?.message ||
      null;
  }

  return null;
}

function getTextFromQuotedMessage(message) {
  let content = message;

  for (let depth = 0; content && depth < 5; depth += 1) {
    const text =
      content.conversation ||
      content.extendedTextMessage?.text ||
      content.imageMessage?.caption ||
      content.videoMessage?.caption ||
      content.documentMessage?.caption;

    if (typeof text === "string" && text.trim()) return text.trim();

    content =
      content.ephemeralMessage?.message ||
      content.viewOnceMessage?.message ||
      content.viewOnceMessageV2?.message ||
      content.documentWithCaptionMessage?.message ||
      null;
  }

  return "";
}

function escapeXml(text) {
  return text.replace(/[<>&"']/g, (character) => {
    const entities = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character];
  });
}

function wrapText(text, maxCharacters) {
  const lines = [];
  let line = "";

  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (word.length > maxCharacters) {
      if (line) {
        lines.push(line);
        line = "";
      }

      for (let index = 0; index < word.length; index += maxCharacters) {
        lines.push(word.slice(index, index + maxCharacters));
      }
      continue;
    }

    if (line && `${line} ${word}`.length > maxCharacters) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function makeAvatar(name) {
  const initial = escapeXml([...name.trim()][0]?.toUpperCase() || "?");
  const svg = Buffer.from(`
    <svg width="${PHOTO_WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#25232a"/>
      <circle cx="${PHOTO_WIDTH / 2}" cy="${HEIGHT / 2}" r="94" fill="#514b5a"/>
      <text x="50%" y="54%" text-anchor="middle" fill="#eee8f5"
        font-family="Arial, sans-serif" font-size="100" font-weight="700">${initial}</text>
    </svg>
  `);

  return sharp(svg).png().toBuffer();
}

function makeQuoteOverlay(quote, name) {
  const cleanQuote = quote
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  const quoteLines = wrapText(`“${cleanQuote}”`, 25);
  const visibleLines = quoteLines.slice(0, MAX_QUOTE_LINES);
  if (quoteLines.length > MAX_QUOTE_LINES) {
    visibleLines[MAX_QUOTE_LINES - 1] = `${visibleLines[MAX_QUOTE_LINES - 1].slice(0, -1)}…`;
  }

  const lineHeight = 38;
  const quoteHeight = visibleLines.length * lineHeight;
  const firstLineY = Math.max(72, (HEIGHT - quoteHeight - 48) / 2 + 24);
  const quoteSvg = visibleLines
    .map(
      (line, index) =>
        `<text x="40" y="${firstLineY + index * lineHeight}">${escapeXml(line)}</text>`,
    )
    .join("");
  const safeName = escapeXml([...name].slice(0, 36).join(""));

  return Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0" stop-color="#000" stop-opacity="1"/>
          <stop offset="1" stop-color="#000" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${WIDTH - PHOTO_WIDTH}" height="${HEIGHT}" fill="#000"/>
      <rect x="${WIDTH - PHOTO_WIDTH}" width="${PHOTO_FADE_WIDTH}" height="${HEIGHT}" fill="url(#fade)"/>
      <g fill="#fff" font-family="Arial, sans-serif" font-size="28" font-weight="700">
        ${quoteSvg}
      </g>
      <text x="40" y="${firstLineY + quoteHeight + 20}" fill="#cdbfe8"
        font-family="Arial, sans-serif" font-size="19" font-weight="600">- ${safeName}</text>
    </svg>
  `);
}

export async function getQuotedAuthorName({
  isGroup,
  remoteJid,
  participantIds,
  contextInfo,
  getGroupMetadata,
  socket,
  webMessage,
}) {
  const contextName =
    contextInfo?.participantName ||
    contextInfo?.verifiedName;
  if (contextName) return contextName;

  const identifiers = new Set(participantIds.map(normalizeJid).filter(Boolean));
  const cachedName = getRememberedParticipantName(identifiers);
  if (cachedName) return cachedName;

  const participantLids = [...identifiers].filter((jid) => jid.endsWith("@lid"));
  const lidMapping = socket?.signalRepository?.lidMapping;
  const getPNForLID = lidMapping?.getPNForLID;
  const getLIDForPN = lidMapping?.getLIDForPN;

  if (getPNForLID) {
    for (const lid of participantLids) {
      try {
        const phoneJid = normalizeJid(
          await getPNForLID.call(lidMapping, lid),
        );
        if (phoneJid) identifiers.add(phoneJid);
      } catch (error) {
        errorLog(
          `[QUOTE] Não foi possível resolver o LID ${lid}: ${error?.message || String(error)}`,
        );
      }
    }
  }

  if (getLIDForPN) {
    const participantPhones = [...identifiers].filter((jid) =>
      jid.endsWith("@s.whatsapp.net"),
    );
    for (const phoneJid of participantPhones) {
      try {
        const lid = normalizeJid(await getLIDForPN.call(lidMapping, phoneJid));
        if (lid) identifiers.add(lid);
      } catch (error) {
        errorLog(
          `[QUOTE] Não foi possível resolver o telefone ${phoneJid}: ${error?.message || String(error)}`,
        );
      }
    }
  }

  const mappedCachedName = getRememberedParticipantName(identifiers);
  if (mappedCachedName) return mappedCachedName;

  if (isGroup) {
    const metadata = await getGroupMetadata(remoteJid);
    const participant = metadata?.participants?.find((item) =>
      [item.id, item.lid, item.phoneNumber, item.jid]
        .map(normalizeJid)
        .some((id) => identifiers.has(id)),
    );

    const participantName =
      participant?.name ||
      participant?.notify ||
      participant?.verifiedName;
    if (participantName) return participantName;
  }

  const commandSenderIds = [
    webMessage?.key?.participant,
    webMessage?.key?.participantAlt,
    webMessage?.key?.senderPn,
    webMessage?.key?.remoteJidAlt,
    !isGroup ? webMessage?.key?.remoteJid : null,
  ]
    .map(normalizeJid)
    .filter(Boolean);
  const isSameSender = commandSenderIds.some((jid) => identifiers.has(jid));
  if (!isGroup || isSameSender) {
    const senderName = webMessage?.pushName || webMessage?.notifyName;
    if (senderName) return senderName;
  }

  throw new InvalidParameterError(
    "Não consegui obter o nome de perfil do autor da mensagem citada. Peça para essa pessoa enviar uma mensagem no grupo e tente novamente.",
  );
}

export default {
  name: "quote",
  description: "Cria uma imagem com a mensagem respondida e a foto do autor.",
  commands: ["quote"],
  usage: `${PREFIX}quote (responda a uma mensagem de texto)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    isGroup,
    isReply,
    remoteJid,
    replyLid,
    webMessage,
    socket,
    getGroupMetadata,
    sendImageFromBuffer,
  }) => {
    const contextInfo = getMessageContextInfo(webMessage.message);
    const quotedMessage = contextInfo?.quotedMessage;
    const quoteText = getTextFromQuotedMessage(quotedMessage);

    if (!isReply || !quoteText) {
      throw new InvalidParameterError(
        `Responda a uma mensagem de texto ou a uma foto com legenda usando ${PREFIX}quote.`,
      );
    }

    const participantIds = [
      contextInfo?.participantPn,
      contextInfo?.participantAlt,
      contextInfo?.participant,
      replyLid,
      !isGroup ? remoteJid : null,
    ]
      .map(normalizeJid)
      .filter(Boolean);
    const authorJid = participantIds[0];

    if (!authorJid) {
      throw new InvalidParameterError(
        "Não consegui identificar o autor da mensagem respondida.",
      );
    }

    const authorName = await getQuotedAuthorName({
      isGroup,
      remoteJid,
      participantIds,
      contextInfo,
      getGroupMetadata,
      socket,
      webMessage,
    });

    let photo;
    for (const jid of participantIds) {
      try {
        const photoUrl = await socket.profilePictureUrl(jid, "image");
        const response = await fetch(photoUrl);
        if (response.status === 404) continue;
        if (!response.ok) {
          throw new Error(`Falha ao baixar a foto de perfil: HTTP ${response.status}`);
        }
        photo = Buffer.from(await response.arrayBuffer());
        break;
      } catch (error) {
        if (
          error?.output?.statusCode !== 404 &&
          error?.status !== 404 &&
          error?.statusCode !== 404
        ) {
          throw error;
        }
      }
    }

    const photoBuffer = photo || (await makeAvatar(authorName));
    const image = await sharp({
      create: {
        width: WIDTH,
        height: HEIGHT,
        channels: 3,
        background: "#000",
      },
    })
      .composite([
        {
          input: await sharp(photoBuffer)
            .resize(PHOTO_WIDTH, HEIGHT, { fit: "cover" })
            .jpeg()
            .toBuffer(),
          left: WIDTH - PHOTO_WIDTH,
          top: 0,
        },
        { input: makeQuoteOverlay(quoteText, authorName), left: 0, top: 0 },
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    await sendImageFromBuffer(image, "", null, false);
  },
};
