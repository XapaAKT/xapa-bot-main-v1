import { onlyNumbers } from "./index.js";

export function toDigits(value = "") {
  return onlyNumbers(String(value));
}

export function toLid(value = "") {
  const digits = toDigits(value);
  return digits ? `${digits}@lid` : null;
}

export function extractTargetJid({ args = [], isReply = false, replyLid = null } = {}) {
  if (isReply && replyLid) return toLid(replyLid);
  if (!args.length) return null;
  return toLid(args[0]);
}

export function extractTwoTargetJids({ args = [], isReply = false, replyLid = null } = {}) {
  if (isReply && replyLid && args.length >= 1) {
    return [toLid(replyLid), toLid(args[0])];
  }

  if (args.length >= 2) {
    return [toLid(args[0]), toLid(args[1])];
  }

  return [null, null];
}

export function formatDateBR(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function daysSince(value) {
  if (!value) return 0;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;

  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function formatCoins(value = 0) {
  const num = Number(value);
  return new Intl.NumberFormat("pt-BR").format(Number.isFinite(num) ? num : 0);
}

export function shipScore(jidA, jidB) {
  const a = toDigits(jidA);
  const b = toDigits(jidB);
  const key = [a, b].sort().join("|");

  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = Math.imul(31, hash) + key.charCodeAt(i) | 0;
  }

  return Math.abs(hash % 101);
}

export function shipBar(score) {
  const total = 10;
  const filled = Math.round((score / 100) * total);
  return `█`.repeat(filled) + `░`.repeat(total - filled);
}