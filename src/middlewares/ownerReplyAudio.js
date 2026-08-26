import fs from "node:fs/promises";
import path from "node:path";
import { delay } from "baileys";

const CONFIG_PATH = path.resolve(
  process.cwd(),
  "database",
  "ownerReplyAudio.json",
);

const DEFAULT_CONFIG = {
  enabled: false,
  ownerLid: "",
  cooldownMs: 30000,
  replyChance: 100,
  audioFiles: ["assets/samples/xing1.mp3"],
  texts: ["kkkk, vi vocês aí."],
};

const cooldownByGroup = new Map();
let cachedConfig = null;
let cachedAt = 0;
const CACHE_MS = 3000;

function normalizeDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

function pickRandom(list = []) {
  if (!Array.isArray(list) || !list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

async function readConfig() {
  const now = Date.now();
  if (cachedConfig && now - cachedAt < CACHE_MS) {
    return cachedConfig;
  }

  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw || "{}");
    cachedConfig = { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    cachedConfig = { ...DEFAULT_CONFIG };
  }

  cachedAt = now;
  return cachedConfig;
}

function isCoolingDown(remoteJid, cooldownMs) {
  const last = cooldownByGroup.get(remoteJid) || 0;
  return Date.now() - last < cooldownMs;
}

function setCooldown(remoteJid) {
  cooldownByGroup.set(remoteJid, Date.now());
}

export async function handleOwnerReplyAudio({ commonFunctions }) {
  const config = await readConfig();

  if (!config.enabled) return false;

  const {
    isGroup,
    remoteJid,
    isReply,
    replyLid,
    userLid,
    sendReply,
    sendAudioFromFile,
  } = commonFunctions || {};

  if (!isGroup || !remoteJid) return false;
  if (!sendReply || !sendAudioFromFile) return false;
  if (!isReply || !replyLid) return false;

  const ownerDigits = normalizeDigits(config.ownerLid);
  const repliedDigits = normalizeDigits(replyLid);
  const senderDigits = normalizeDigits(userLid);

  if (!ownerDigits) return false;
  if (repliedDigits !== ownerDigits) return false;
  if (senderDigits === ownerDigits) return false;

  const cooldownMs = Number(config.cooldownMs || 30000);
  if (isCoolingDown(remoteJid, cooldownMs)) return false;

  const chance = Number(config.replyChance ?? 100);
  if (Math.random() * 100 >= chance) return false;

  const text = pickRandom(config.texts) || "kkkk, vi vocês aí.";
  const audioRelative = pickRandom(config.audioFiles) || "assets/samples/xing1.mp3";
  const audioPath = path.resolve(process.cwd(), audioRelative);

  try {
    await fs.access(audioPath);
  } catch {
    return false;
  }

  setCooldown(remoteJid);

  await sendReply(text);
  await delay(1200);
  await sendAudioFromFile(audioPath, true);

  return true;
}