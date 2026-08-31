import { delay } from "baileys";
import path from "node:path";
import { ASSETS_DIR } from "../config.js";

const OWNER_LID = "227886971789349@lid"; // troque pelo seu número
const COOLDOWN_MS = 30_000;

let lastRunAt = 0;

const AUDIO_FILE = path.join(
  ASSETS_DIR,
  "audios",
  "eventos",
  "xing1.mp3",
);

const TEXTS = [
  "para de marcar ae porra kk",
  "bcetao, ja falei para parar ja carai",
  "olha ocs todo errado me marcando ai tmnc viu",
  "para de responder as minhas msg porraaa",
  "não é só pq to off,que eu deixei vcs me marcar slk",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function normalizeDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

function getQuotedSender(quotedMessage) {
  return (
    quotedMessage?.key?.participant ||
    quotedMessage?.participant ||
    quotedMessage?.sender ||
    quotedMessage?.senderId ||
    quotedMessage?.remoteJid ||
    null
  );
}

export async function handleOwnerAudioEvent({
  quotedMessage,
  sendReply,
  sendAudioFromFile,
}) {
  const now = Date.now();

  if (now - lastRunAt < COOLDOWN_MS) {
    return false;
  }

  if (!quotedMessage) {
    return false;
  }

  const quotedSender = getQuotedSender(quotedMessage);
  if (!quotedSender) {
    return false;
  }

  const ownerDigits = normalizeDigits(OWNER_LID);
  const quotedDigits = normalizeDigits(quotedSender);

  if (!ownerDigits || quotedDigits !== ownerDigits) {
    return false;
  }

  lastRunAt = now;

  const text = pickRandom(TEXTS);

  if (sendReply) {
    await sendReply(text);
  }

  await delay(1500);

  if (sendAudioFromFile) {
    await sendAudioFromFile(AUDIO_FILE, true);
  }

  return true;
}