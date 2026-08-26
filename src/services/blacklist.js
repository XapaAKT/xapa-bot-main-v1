// scr/service/blacklist.js
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLACKLIST_FILE = path.resolve(
  __dirname,
  "..",
  "database",
  "blacklist.json",
);

function normalizeDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

function formatDateBR(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

async function ensureFile() {
  try {
    await fs.access(BLACKLIST_FILE);
  } catch {
    await fs.mkdir(path.dirname(BLACKLIST_FILE), { recursive: true });
    await fs.writeFile(BLACKLIST_FILE, "[]", "utf8");
  }
}

async function readList() {
  await ensureFile();

  try {
    const raw = await fs.readFile(BLACKLIST_FILE, "utf8");
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    await fs.writeFile(BLACKLIST_FILE, "[]", "utf8");
    return [];
  }
}

async function writeList(list) {
  await ensureFile();
  await fs.writeFile(BLACKLIST_FILE, JSON.stringify(list, null, 2), "utf8");
}

export async function getBlacklist() {
  return await readList();
}

export async function getBlacklistEntry(jid) {
  const list = await readList();
  const digits = normalizeDigits(jid);

  if (!digits) return null;

  return (
    list.find((item) => {
      const stored = normalizeDigits(item.number || item.jid || item.mention || "");
      return stored === digits;
    }) || null
  );
}

export async function isBlacklisted(jid) {
  return !!(await getBlacklistEntry(jid));
}

export async function addToBlacklist({ jid, name = "", reason = "", addedBy = "" }) {
  const list = await readList();
  const digits = normalizeDigits(jid);

  if (!digits) {
    throw new Error("Número inválido.");
  }

  const exists = list.some((item) => {
    const stored = normalizeDigits(item.number || item.jid || item.mention || "");
    return stored === digits;
  });

  if (exists) {
    throw new Error("Essa pessoa já está na blacklist.");
  }

  const entry = {
    number: digits,
    mention: `@${digits}`,
    name: name || `@${digits}`,
    reason: reason || "",
    addedBy: normalizeDigits(addedBy) || "",
    addedAt: new Date().toISOString(),
  };

  list.push(entry);
  await writeList(list);

  return entry;
}

export async function removeFromBlacklist(jid) {
  const list = await readList();
  const digits = normalizeDigits(jid);

  const filtered = list.filter((item) => {
    const stored = normalizeDigits(item.number || item.jid || item.mention || "");
    return stored !== digits;
  });

  await writeList(filtered);
  return filtered.length !== list.length;
}

export function buildBlacklistText(list = []) {
  const readMore = String.fromCharCode(8206).repeat(4001);

  const lines = list.length
    ? list.map((item, index) => {
        return `【 ${index + 1} 】 ${item.mention || item.name || "-"}\n📱 ${item.number || item.jid || "-"}\n📝 ${item.reason || "-"}\n📅 ${formatDateBR(item.addedAt)}`;
      })
    : ["Nenhum usuário na blacklist."];

  return `╭━━━━━━━━━━━━━⛓️
│ 『 BLACKLIST 』
│
│ Total: ${list.length}
│
${readMore}
${lines.map((line) => `│ ${line.replace(/\n/g, "\n│ ")}`).join("\n│\n")}
╰━━━━━━━━━━━━━━━━━━`;
}