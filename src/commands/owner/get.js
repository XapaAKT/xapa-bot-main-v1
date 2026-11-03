import fs from "node:fs/promises";
import path from "node:path";
import { inspect } from "node:util";
import { DATABASE_DIR, PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import {
  download,
  getContent,
  removeFileIfExists,
} from "../../utils/index.js";

const RAW_LIMIT = 30000;
const SAVES_DIR = path.join(DATABASE_DIR, "get");
const NAME_PATTERN = /^[\p{L}\p{N}_-]{1,40}$/u;
const MEDIA_EXTENSIONS = {
  image: "png",
  video: "mp4",
  audio: "mpeg",
  sticker: "webp",
  document: "bin",
};

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

function getMedia(quotedMessage) {
  const message = unwrapMessage(quotedMessage);
  const types = ["image", "video", "audio", "sticker", "document"];

  for (const type of types) {
    const content = getContent({ message }, type);
    if (content) return { type, content, message };
  }

  return null;
}

function getText(message) {
  return (
    message?.conversation ||
    message?.extendedTextMessage?.text ||
    message?.imageMessage?.caption ||
    message?.videoMessage?.caption ||
    message?.documentMessage?.caption ||
    ""
  );
}

async function downloadMedia(media) {
  const extension = MEDIA_EXTENSIONS[media.type];
  const filePath = await download(
    { message: media.message },
    `get-${Date.now()}`,
    media.type,
    extension,
  );

  if (!filePath) {
    throw new WarningError("Não foi possível baixar a mídia marcada.");
  }

  try {
    return await fs.readFile(filePath);
  } finally {
    await removeFileIfExists(filePath);
  }
}

function createRawMessage(quotedMessage, contextInfo, remoteJid) {
  return {
    key: {
      remoteJid,
      participant: contextInfo?.participant,
      id: contextInfo?.stanzaId,
    },
    messageTimestamp: contextInfo?.quotedMessageTimestamp,
    pushName: contextInfo?.pushName,
    message: quotedMessage,
  };
}

function createRawText(rawMessage) {
  const raw = inspect(rawMessage, {
    colors: false,
    depth: 8,
    maxArrayLength: 100,
  });

  return raw;
}

function validateName(name) {
  if (!NAME_PATTERN.test(name || "")) {
    throw new WarningError(
      "Use um nome simples (1 a 40 caracteres, sem espaços). Exemplo: ¡get salvar meu-video",
    );
  }
}

function getSaveDir(name) {
  validateName(name);
  return path.join(SAVES_DIR, name);
}

async function saveMessage(name, rawMessage, media) {
  const saveDir = getSaveDir(name);
  await fs.mkdir(saveDir, { recursive: true });

  await fs.writeFile(
    path.join(saveDir, "message.json"),
    JSON.stringify(rawMessage, null, 2),
    "utf8",
  );

  if (media) {
    const buffer = await downloadMedia(media);
    await fs.writeFile(
      path.join(saveDir, `media.${MEDIA_EXTENSIONS[media.type]}`),
      buffer,
    );
    await fs.writeFile(
      path.join(saveDir, "meta.json"),
      JSON.stringify({
        type: media.type,
        mimetype: media.content?.mimetype || null,
        fileName: media.content?.fileName || null,
        caption: media.content?.caption || "",
        ptt: Boolean(media.content?.ptt),
        gifPlayback: Boolean(media.content?.gifPlayback),
      }, null, 2),
      "utf8",
    );
  } else {
    await fs.rm(path.join(saveDir, "meta.json"), { force: true });
    await Promise.all(
      Object.values(MEDIA_EXTENSIONS).map((extension) =>
        fs.rm(path.join(saveDir, `media.${extension}`), { force: true }),
      ),
    );
  }
}

async function listSavedMessages() {
  await fs.mkdir(SAVES_DIR, { recursive: true });
  const entries = await fs.readdir(SAVES_DIR, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function loadSavedMessage(name) {
  const saveDir = getSaveDir(name);
  let rawMessage;
  try {
    rawMessage = JSON.parse(
      await fs.readFile(path.join(saveDir, "message.json"), "utf8"),
    );
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new WarningError(`Não existe uma mensagem salva com o nome "${name}".`);
    }
    throw error;
  }
  let meta = null;

  try {
    meta = JSON.parse(await fs.readFile(path.join(saveDir, "meta.json"), "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  let media = null;
  if (meta) {
    const filePath = path.join(saveDir, `media.${MEDIA_EXTENSIONS[meta.type]}`);
    media = { type: meta.type, content: meta, buffer: await fs.readFile(filePath) };
  }

  return { rawMessage, media };
}

async function sendRaw(socket, remoteJid, rawMessage) {
  const raw = createRawText(rawMessage);
  if (raw.length <= RAW_LIMIT) {
    await socket.sendMessage(remoteJid, {
      text: `🧾 𝐑𝐀𝐖 𝐃𝐀 𝐌𝐄𝐍𝐒𝐀𝐆𝐄𝐌\n\n\`\`\`\n${raw}\n\`\`\``,
    });
    return;
  }

  await socket.sendMessage(remoteJid, {
    document: Buffer.from(raw, "utf8"),
    mimetype: "text/plain",
    fileName: "mensagem-raw.txt",
    caption: "🧾 RAW completo da mensagem (arquivo).",
  });
}

async function sendCopiedMessage(socket, remoteJid, quotedMessage, mediaOverride) {
  const media = mediaOverride || getMedia(quotedMessage);
  if (!media) {
    await socket.sendMessage(remoteJid, {
      text: getText(unwrapMessage(quotedMessage)) || "Mensagem sem texto.",
    });
    return;
  }

  const buffer = media.buffer || await downloadMedia(media);
  const caption = media.content?.caption || "";

  switch (media.type) {
    case "image":
      await socket.sendMessage(remoteJid, { image: buffer, caption });
      break;
    case "video":
      await socket.sendMessage(remoteJid, {
        video: buffer,
        caption,
        mimetype: media.content?.mimetype,
        gifPlayback: Boolean(media.content?.gifPlayback),
      });
      break;
    case "audio":
      await socket.sendMessage(remoteJid, {
        audio: buffer,
        mimetype: media.content?.mimetype || "audio/mpeg",
        ptt: Boolean(media.content?.ptt),
      });
      break;
    case "sticker":
      await socket.sendMessage(remoteJid, { sticker: buffer });
      break;
    case "document":
      await socket.sendMessage(remoteJid, {
        document: buffer,
        mimetype: media.content?.mimetype || "application/octet-stream",
        fileName: media.content?.fileName || "arquivo",
        caption,
      });
      break;
    default:
      throw new WarningError(`Tipo de mídia não suportado: ${media.type}`);
  }
}

export default {
  name: "get",
  description: "Exibe, copia e salva mensagens respondidas.",
  commands: ["get", "getmsg", "copiar-mensagem"],
  usage: `${PREFIX}get salvar <nome> (respondendo uma mensagem)`,

  handle: async ({
    args,
    webMessage,
    remoteJid,
    socket,
    sendReply,
    sendSuccessReact,
  }) => {
    const action = String(args?.[0] || "").toLowerCase();

    if (action === "lista" || action === "list") {
      const names = await listSavedMessages();
      await sendReply(
        names.length
          ? `📚 𝐌𝐄𝐍𝐒𝐀𝐆𝐄𝐍𝐒 𝐒𝐀𝐋𝐕𝐀𝐒\n\n${names.map((name, index) => `${index + 1}. ${name}`).join("\n")}`
          : "📚 Nenhuma mensagem salva ainda.",
      );
      return;
    }

    if (action === "apagar" || action === "delete" || action === "remover") {
      const name = args?.[1];
      validateName(name);
      await fs.rm(getSaveDir(name), { recursive: true, force: true });
      await sendReply(`🗑️ Mensagem salva "${name}" removida.`);
      return;
    }

    if (action === "salvar" || action === "save") {
      const name = args?.[1];
      validateName(name);
      const contextInfo = getContextInfo(webMessage?.message);
      const quotedMessage = contextInfo?.quotedMessage;
      if (!quotedMessage) {
        throw new WarningError(`Responda a uma mensagem para usar ${PREFIX}get salvar ${name}.`);
      }

      const rawMessage = createRawMessage(quotedMessage, contextInfo, remoteJid);
      await saveMessage(name, rawMessage, getMedia(quotedMessage));
      await sendSuccessReact();
      await sendReply(`💾 Mensagem "${name}" salva na pasta database/get/${name}.`);
      return;
    }

    if (action && action !== "copiar" && action !== "copy") {
      const saved = await loadSavedMessage(action);
      await sendRaw(socket, remoteJid, saved.rawMessage);
      await sendCopiedMessage(socket, remoteJid, saved.rawMessage.message, saved.media);
      await sendSuccessReact();
      return;
    }

    const contextInfo = getContextInfo(webMessage?.message);
    const quotedMessage = contextInfo?.quotedMessage;

    if (!quotedMessage) {
      throw new WarningError(
        `Responda a uma mensagem e use ${PREFIX}get para copiar o conteúdo.`,
      );
    }

    await sendRaw(
      socket,
      remoteJid,
      createRawMessage(quotedMessage, contextInfo, remoteJid),
    );
    await sendCopiedMessage(socket, remoteJid, quotedMessage);
    await sendSuccessReact();
  },
};
