import fs from "node:fs/promises";
import path from "node:path";
import { downloadContentFromMessage } from "baileys";

const SAVE_DIR = path.resolve(process.cwd(), "videos");

function pickQuotedOrCurrentMedia(webMessage) {
  const msg = webMessage?.message || {};
  const quoted = msg?.extendedTextMessage?.contextInfo?.quotedMessage || null;

  const candidates = [
    { data: msg?.imageMessage, type: "image" },
    { data: msg?.videoMessage, type: "video" },
    { data: quoted?.imageMessage, type: "image" },
    { data: quoted?.videoMessage, type: "video" },
  ];

  return candidates.find((item) => item.data) || null;
}

function getExtension(mimetype = "", type = "image") {
  const mime = String(mimetype).toLowerCase();

  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("mp4")) return "mp4";

  return type === "video" ? "mp4" : "jpg";
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function downloadMedia(messageData, type) {
  const stream = await downloadContentFromMessage(messageData, type);
  return await streamToBuffer(stream);
}

export default {
  name: "salvar",
  description: "Salva imagem ou vídeo sem prefixo",
  commands: ["rsrskk", "olocokk", "salvar", "dlc", "amor...", "pqp"],
  noPrefix: true,
  isEmojiCommand: true,
  usage: "Responda qualquer imagem/foto com um das mensagens ai e depois cheque os arquivos do bot.",

  handle: async ({
    webMessage,
  }) => {
    const media = pickQuotedOrCurrentMedia(webMessage);

    if (!media?.data) {
      return;
    }

    try {
      await fs.mkdir(SAVE_DIR, { recursive: true });

      const mimetype = media.data.mimetype || "";
      const ext = getExtension(mimetype, media.type);
      const fileName = `midia_${Date.now()}.${ext}`;
      const filePath = path.join(SAVE_DIR, fileName);

      const buffer = await downloadMedia(media.data, media.type);
      await fs.writeFile(filePath, buffer);
    } catch (error) {
      return;
    }
  },
};