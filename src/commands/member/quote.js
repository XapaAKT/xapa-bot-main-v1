import sharp from "sharp";
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

const WIDTH = 800;
const HEIGHT = 450;
const PHOTO_WIDTH = 440;
const MAX_QUOTE_LINES = 7;

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
        <linearGradient id="fade" x1="0" x2="1">
          <stop offset="0" stop-color="#000" stop-opacity="1"/>
          <stop offset="0.58" stop-color="#000" stop-opacity="1"/>
          <stop offset="1" stop-color="#000" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${WIDTH - PHOTO_WIDTH}" height="${HEIGHT}" fill="#000"/>
      <rect x="${WIDTH - PHOTO_WIDTH}" width="${PHOTO_WIDTH}" height="${HEIGHT}" fill="url(#fade)"/>
      <g fill="#fff" font-family="Arial, sans-serif" font-size="28" font-weight="700">
        ${quoteSvg}
      </g>
      <text x="40" y="${firstLineY + quoteHeight + 20}" fill="#cdbfe8"
        font-family="Arial, sans-serif" font-size="19" font-weight="600">- ${safeName}</text>
    </svg>
  `);
}

async function getQuotedAuthorName({ isGroup, remoteJid, replyLid, contextInfo, getGroupMetadata }) {
  if (isGroup) {
    const metadata = await getGroupMetadata(remoteJid);
    const normalizedReplyLid = replyLid?.replace(/:[0-9]+(?=@)/, "");
    const participant = metadata?.participants?.find((item) =>
      [item.id, item.lid, item.phoneNumber]
        .filter(Boolean)
        .some((id) => id.replace(/:[0-9]+(?=@)/, "") === normalizedReplyLid),
    );

    if (participant?.name || participant?.notify) {
      return participant.name || participant.notify;
    }
  }

  return contextInfo?.pushName || "Usuário";
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
    replyText,
    webMessage,
    socket,
    getGroupMetadata,
    sendImageFromBuffer,
  }) => {
    if (!isReply || !replyText?.trim()) {
      throw new InvalidParameterError(
        `Responda a uma mensagem de texto com ${PREFIX}quote.`,
      );
    }

    const contextInfo =
      webMessage.message?.extendedTextMessage?.contextInfo ||
      webMessage.message?.imageMessage?.contextInfo ||
      webMessage.message?.videoMessage?.contextInfo ||
      webMessage.message?.documentMessage?.contextInfo;
    const authorJid = replyLid || (!isGroup ? remoteJid : null);

    if (!authorJid) {
      throw new InvalidParameterError(
        "Não consegui identificar o autor da mensagem respondida.",
      );
    }

    const authorName = await getQuotedAuthorName({
      isGroup,
      remoteJid,
      replyLid: authorJid,
      contextInfo,
      getGroupMetadata,
    });

    let photo;
    try {
      const photoUrl = await socket.profilePictureUrl(authorJid, "image");
      const response = await fetch(photoUrl);
      if (response.status === 404) {
        photo = undefined;
      } else if (!response.ok) {
        throw new Error(`Falha ao baixar a foto de perfil: HTTP ${response.status}`);
      } else {
        photo = Buffer.from(await response.arrayBuffer());
      }
    } catch (error) {
      if (
        error?.output?.statusCode !== 404 &&
        error?.status !== 404 &&
        error?.statusCode !== 404
      ) {
        throw error;
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
        { input: makeQuoteOverlay(replyText, authorName), left: 0, top: 0 },
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    await sendImageFromBuffer(image, "", null, false);
  },
};
