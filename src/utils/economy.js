import fs from "node:fs";
import path from "node:path";
import { DATABASE_DIR } from "../config.js";

const ECONOMY_FILE = path.join(DATABASE_DIR, "economy.json");

function ensureEconomyFile() {
  if (!fs.existsSync(DATABASE_DIR)) {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
  }

  if (!fs.existsSync(ECONOMY_FILE)) {
    fs.writeFileSync(ECONOMY_FILE, "{}");
  }
}

export function readEconomy() {
  try {
    ensureEconomyFile();

    const raw = fs.readFileSync(ECONOMY_FILE, "utf8").trim();
    if (!raw) return {};

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
}

export function saveEconomy(db) {
  fs.writeFileSync(ECONOMY_FILE, JSON.stringify(db, null, 2));
}

function cleanName(name = "usuário") {
  const value = String(name || "").trim();
  if (!value || value === ".") return "usuário";
  return value;
}

function normalizeEntry(entry, name = "usuário") {
  const now = Date.now();

  return {
    coins: Number(entry?.coins) || 0,
    xp: Number(entry?.xp) || 0,
    lastWork: Number(entry?.lastWork) || 0,
    lastDaily: Number(entry?.lastDaily) || 0,
    name: cleanName(entry?.name || name),
    createdAt: entry?.createdAt || new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
  };
}

export function getUserEconomy(userLid, name = "usuário") {
  const db = readEconomy();
  const key = String(userLid || "unknown");

  db[key] = normalizeEntry(db[key], name);
  saveEconomy(db);

  return db[key];
}

export function updateUserEconomy(userLid, name, updater) {
  const db = readEconomy();
  const key = String(userLid || "unknown");

  const current = normalizeEntry(db[key], name);
  const next = updater({ ...current });

  db[key] = normalizeEntry(next, name);
  saveEconomy(db);

  return db[key];
}

export function setUserEconomy(userLid, entry, name = "usuário") {
  const db = readEconomy();
  const key = String(userLid || "unknown");

  db[key] = normalizeEntry(entry, name);
  saveEconomy(db);

  return db[key];
}

export function getTopEconomy(limit = 10) {
  const db = readEconomy();

  return Object.entries(db)
    .map(([userLid, data]) => ({
      userLid,
      ...normalizeEntry(data),
    }))
    .sort((a, b) => b.coins - a.coins)
    .slice(0, limit);
}

export function formatCoins(value) {
  return Number(value || 0).toLocaleString("pt-BR");
}

export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.ceil(Number(ms) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];

  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || !parts.length) parts.push(`${seconds}s`);

  return parts.join(" ");
}

export function extractMentionedJids(webMessage) {
  const contextInfo =
    webMessage?.message?.extendedTextMessage?.contextInfo ||
    webMessage?.message?.imageMessage?.contextInfo ||
    webMessage?.message?.videoMessage?.contextInfo ||
    webMessage?.message?.documentMessage?.contextInfo ||
    webMessage?.message?.buttonsResponseMessage?.contextInfo ||
    webMessage?.message?.templateButtonReplyMessage?.contextInfo ||
    webMessage?.message?.listResponseMessage?.contextInfo ||
    null;

  return [...new Set(contextInfo?.mentionedJid || [])];
}

export function getQuotedParticipant(webMessage) {
  const contextInfo = webMessage?.message?.extendedTextMessage?.contextInfo || null;
  return contextInfo?.participant || null;
}