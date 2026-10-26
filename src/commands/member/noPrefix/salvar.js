import fs from "node:fs/promises";
import path from "node:path";
import { downloadContentFromMessage } from "baileys";
import { OWNER_LID } from "../../../config.js";
import { errorLog } from "../../../utils/logger.js";

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

function sanitizeFolderName(name, fallback) {
  let folderName = String(name || "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/[. ]+$/g, "")
    .trim()
    .slice(0, 80);

  if (!folderName) {
    folderName = String(fallback || "Desconhecido").replace(
      /[^a-zA-Z0-9_-]/g,
      "_",
    );
  }

  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(folderName)) {
    folderName = `_${folderName}`;
  }

  return folderName;
}

function normalizeJid(jid) {
  return typeof jid === "string"
    ? jid.replace(/:\d+(?=@)/g, "").trim()
    : "";
}

function getDisplayName(contact) {
  return (
    contact?.name ||
    contact?.notify ||
    contact?.verifiedName ||
    contact?.username ||
    ""
  );
}

function getContextInfo(message) {
  if (!message) return null;

  const contextInfo =
    message.extendedTextMessage?.contextInfo ||
    message.imageMessage?.contextInfo ||
    message.videoMessage?.contextInfo;
  if (contextInfo) return contextInfo;

  return getContextInfo(
    message.ephemeralMessage?.message ||
      message.viewOnceMessage?.message ||
      message.viewOnceMessageV2?.message,
  );
}

export async function getMediaSenderName({ socket, webMessage }) {
  const contextInfo = getContextInfo(webMessage?.message);
  const quotedMessage = contextInfo?.quotedMessage;
  const isQuotedMedia = Boolean(
    quotedMessage?.imageMessage || quotedMessage?.videoMessage,
  );

  if (isQuotedMedia) {
    const participantIdentifiers = [
      contextInfo?.participantPn,
      contextInfo?.participantAlt,
      contextInfo?.participant,
    ]
      .map(normalizeJid)
      .filter(Boolean);
    let participantName = contextInfo?.participantName || "";
    let phoneJid = participantIdentifiers.find((jid) =>
      jid.endsWith("@s.whatsapp.net"),
    ) || "";
    const groupJid = webMessage?.key?.remoteJid;

    if (groupJid?.endsWith("@g.us") && participantIdentifiers.length) {
      try {
        const metadata = await socket.groupMetadata(groupJid);
        const participant = metadata?.participants?.find(
          (item) => {
            const identifiers = [
              item.id,
              item.lid,
              item.phoneNumber,
            ].map(normalizeJid);
            return identifiers.some((identifier) =>
              participantIdentifiers.includes(identifier),
            );
          },
        );
        if (participant) {
          participantName = getDisplayName(participant);
          phoneJid ||= [
            participant.phoneNumber,
            participant.id,
          ]
            .map(normalizeJid)
            .find((jid) => jid.endsWith("@s.whatsapp.net")) || "";
        }
      } catch (error) {
        errorLog(
          `[SALVAR] Não foi possível consultar os dados de quem enviou a mídia: ${error?.message || String(error)}`,
        );
      }
    }

    const participantLid = participantIdentifiers.find((jid) =>
      jid.endsWith("@lid"),
    );
    if (!phoneJid && participantLid) {
      try {
        const getPNForLID = socket?.signalRepository?.lidMapping?.getPNForLID;
        phoneJid = normalizeJid(
          getPNForLID
            ? await getPNForLID.call(
                socket.signalRepository.lidMapping,
                participantLid,
              )
            : "",
        );
      } catch (error) {
        errorLog(
          `[SALVAR] Não foi possível converter o LID em JID: ${error?.message || String(error)}`,
        );
      }
    }

    const folderLabel = [participantName, phoneJid].filter(Boolean).join(" - ");
    return sanitizeFolderName(folderLabel, phoneJid || "Desconhecido");
  }

  const key = webMessage?.key || {};
  const senderIdentifiers = [
    key.participantAlt,
    key.senderPn,
    key.remoteJidAlt,
    key.participant,
    key.remoteJid,
  ].map(normalizeJid);
  let phoneJid =
    senderIdentifiers.find((jid) => jid.endsWith("@s.whatsapp.net")) || "";

  const senderLid =
    senderIdentifiers.find((jid) => jid.endsWith("@lid")) || "";
  if (!phoneJid && senderLid) {
    try {
      const getPNForLID = socket?.signalRepository?.lidMapping?.getPNForLID;
      phoneJid = normalizeJid(
        getPNForLID
          ? await getPNForLID.call(
              socket.signalRepository.lidMapping,
              senderLid,
            )
          : "",
      );
    } catch (error) {
      errorLog(
        `[SALVAR] Não foi possível converter o LID em JID: ${error?.message || String(error)}`,
      );
    }
  }

  const senderName = webMessage?.pushName || webMessage?.notifyName || "";
  const folderLabel = [senderName, phoneJid].filter(Boolean).join(" - ");
  return sanitizeFolderName(folderLabel, senderName || "Desconhecido");
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
  commands: [
    "rsrskk",
    "olocokk",
    "salvar",
    "dlc",
    "amor...",
    "pqp",
    "❤️",
  ],
  noPrefix: true,
  isEmojiCommand: true,
  usage: "Responda qualquer imagem/foto com um das mensagens ai e depois cheque os arquivos do bot.",

  handle: async ({
    webMessage,
    socket,
  }) => {
    const media = pickQuotedOrCurrentMedia(webMessage);

    if (!media?.data) {
      return;
    }

    try {
      const memberName = await getMediaSenderName({
        socket,
        webMessage,
      });
      const memberDir = path.join(SAVE_DIR, memberName);
      const mediaFolder = media.type === "image" ? "Fotos" : "Videos";
      const mediaDir = path.join(memberDir, mediaFolder);
      const mimetype = media.data.mimetype || "";
      const ext = getExtension(mimetype, media.type);
      const fileName = `midia_${Date.now()}.${ext}`;
      const filePath = path.join(mediaDir, fileName);

      await fs.mkdir(path.join(memberDir, "Fotos"), { recursive: true });
      await fs.mkdir(path.join(memberDir, "Videos"), { recursive: true });
      const buffer = await downloadMedia(media.data, media.type);
      await fs.writeFile(filePath, buffer);
    } catch (error) {
      const details = error?.stack || error?.message || String(error);
      errorLog(`[SALVAR] Erro ao salvar mídia: ${details}`);

      try {
        await socket.sendMessage(OWNER_LID, {
          text:
            `❌ Erro no comando salvar.\n` +
            `Chat: ${webMessage?.key?.remoteJid || "desconhecido"}\n` +
            `Detalhes: ${error?.message || String(error)}`,
        });
      } catch (notificationError) {
        errorLog(
          `[SALVAR] Não foi possível avisar o proprietário no privado: ${notificationError?.stack || notificationError?.message || String(notificationError)}`,
        );
      }
    }
  },
};