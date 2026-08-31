import fs from "node:fs";
import path from "node:path";
import { delay } from "baileys";
import { ASSETS_DIR, OWNER_LID } from "./config.js";
import { isActiveOwnerReplyAudio } from "./utils/database.js";

const COOLDOWN = 30000;

const lastReply = new Map();

const audios = ["xing1.mp3"];

const texts = [
  "sei que não to aqui mais, mas para de marcar ae porra kk",
  "bcetao, ja falei para parar ja carai",
  "olha ocs todo errado me marcando ai tmnc viu",
  "para de responder as minhas msg porraaa",
  "não é só pq eu sai, que eu deixei vcs me marcar slk",
];

function randomAudio() {
  return audios[Math.floor(Math.random() * audios.length)];
}

function normalizeJid(value = "") {
  return String(value).replace(/:[0-9]+(?=@)/g, "").trim();
}

function randomText() {
  return texts[Math.floor(Math.random() * texts.length)];
}

function getContextInfo(webMessage) {
  const message = webMessage?.message;

  if (!message) return null;

  const contextInfo =
    message.extendedTextMessage?.contextInfo ||
    message.imageMessage?.contextInfo ||
    message.videoMessage?.contextInfo ||
    message.documentMessage?.contextInfo ||
    message.audioMessage?.contextInfo ||
    message.stickerMessage?.contextInfo;

  if (contextInfo) return contextInfo;

  if (message.ephemeralMessage?.message || message.viewOnceMessage?.message) {
    return getContextInfo({
      ...webMessage,
      message:
        message.ephemeralMessage?.message || message.viewOnceMessage.message,
    });
  }

  return null;
}

export async function handleOwnerReplyAudio({
  webMessage,
  commonFunctions,
}) {
  try {
    const { sendAudioFromFile, sendReply } = commonFunctions;

    const remoteJid = webMessage?.key?.remoteJid;

    // Só funciona em grupos
    if (!remoteJid?.endsWith("@g.us")) return;
    if (!isActiveOwnerReplyAudio(remoteJid)) return;

    const contextInfo = getContextInfo(webMessage);
    if (!contextInfo) return;

    const ownerJid = normalizeJid(OWNER_LID);
    const quotedOwner = normalizeJid(contextInfo.participant) === ownerJid;
    const mentionedJids = [
      ...(contextInfo.mentionedJid || []),
      ...(contextInfo.mentionedJidAlt || []),
    ].map(normalizeJid);
    const mentionedOwner = mentionedJids.includes(ownerJid);

    // Dispara ao responder uma mensagem do dono ou ao mencionar o dono.
    if (!quotedOwner && !mentionedOwner) return;

    const now = Date.now();

    // Cooldown por grupo
    const last = lastReply.get(remoteJid);

    if (last && now - last < COOLDOWN) {
      return;
    }

    lastReply.set(remoteJid, now);

    const audio = randomAudio();

    const file = path.join(
      ASSETS_DIR,
      "audios",
      "eventos",
      audio,
    );

    if (!fs.existsSync(file)) {
      console.log("[MSG EVENT] Áudio não encontrado:", file);
      return;
    }

    await sendReply(randomText());
    await delay(1500);
    await sendAudioFromFile(file, true);

  } catch (err) {
    console.log("[MSG EVENT]", err.message);
  }
}