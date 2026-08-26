import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  daysSince,
  formatCoins,
  formatDateBR,
} from "../utils/family.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const DB_DIR = path.resolve(ROOT_DIR, "src", "database", "family");

const FAMILIES_FILE = path.join(DB_DIR, "families.json");
const PROPOSALS_FILE = path.join(DB_DIR, "proposals.json");
const HISTORY_FILE = path.join(DB_DIR, "history.json");
const CONFIG_FILE = path.join(DB_DIR, "config.json");

const DEFAULT_CONFIG = {
  maxChildren: 5,
};

const ECONOMY_CANDIDATES = [
  path.resolve(ROOT_DIR, "src", "database", "economy.json"),
  path.resolve(ROOT_DIR, "src", "database", "coins.json"),
  path.resolve(ROOT_DIR, "src", "database", "users.json"),
  path.resolve(ROOT_DIR, "database", "economy.json"),
  path.resolve(ROOT_DIR, "database", "coins.json"),
  path.resolve(ROOT_DIR, "database", "users.json"),
];

function normalizeJid(jid = "") {
  return String(jid).replace(/\D/g, "");
}

function now() {
  return new Date().toISOString();
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function makeFamilyName(a, b) {
  const da = normalizeJid(a).slice(-4) || "0000";
  const db = normalizeJid(b).slice(-4) || "0000";
  return `Família ${da}-${db}`;
}

function isActiveFamily(family) {
  return family?.status === "active" && family?.married === true;
}

function isArchivedFamily(family) {
  return family?.status === "divorced" || family?.married === false;
}

function familyMembers(family) {
  const spouses = Array.isArray(family?.spouses) ? family.spouses : [];
  const children = Array.isArray(family?.children) ? family.children : [];
  return [...spouses, ...children].map(normalizeJid).filter(Boolean);
}

function isMemberOfFamily(family, jid) {
  const target = normalizeJid(jid);
  if (!target || !family) return false;
  return familyMembers(family).includes(target);
}

function isSpouseOfFamily(family, jid) {
  const target = normalizeJid(jid);
  if (!target || !family) return false;
  const spouses = Array.isArray(family.spouses) ? family.spouses : [];
  return spouses.map(normalizeJid).includes(target);
}

function isChildOfFamily(family, jid) {
  const target = normalizeJid(jid);
  if (!target || !family) return false;
  const children = Array.isArray(family.children) ? family.children : [];
  return children.map(normalizeJid).includes(target);
}

function pickNewest(a, b) {
  const ta = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
  const tb = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
  return tb - ta;
}

function getActiveFamilyByJidFromState(families, jid) {
  const target = normalizeJid(jid);
  return (
    families.find((family) => isActiveFamily(family) && isMemberOfFamily(family, target)) ||
    null
  );
}

function getActiveSpouseFamilyByJidFromState(families, jid) {
  const target = normalizeJid(jid);
  return (
    families.find((family) => isActiveFamily(family) && isSpouseOfFamily(family, target)) ||
    null
  );
}

function getLatestFamilyRecordByJidFromState(families, jid) {
  const target = normalizeJid(jid);
  const records = families
    .filter((family) => isMemberOfFamily(family, target))
    .sort(pickNewest);

  return records[0] || null;
}

function getFamilyRecordForAbandonFromState(families, parentJid, childJid) {
  const parent = normalizeJid(parentJid);
  const child = normalizeJid(childJid);

  const records = families
    .filter((family) => isSpouseOfFamily(family, parent))
    .filter((family) => isChildOfFamily(family, child))
    .sort((a, b) => {
      const activeA = isActiveFamily(a) ? 1 : 0;
      const activeB = isActiveFamily(b) ? 1 : 0;
      if (activeA !== activeB) return activeB - activeA;
      return pickNewest(a, b);
    });

  return records[0] || null;
}

function getFamilyRole(family, jid) {
  const target = normalizeJid(jid);
  if (!family || !target) return "member";

  if (isSpouseOfFamily(family, target)) {
    return isActiveFamily(family) ? "spouse" : "former-spouse";
  }

  if (isChildOfFamily(family, target)) {
    return "child";
  }

  return "member";
}

function getFamilyScore(family) {
  const xp = Number(family?.xp || 0);
  const children = Array.isArray(family?.children) ? family.children.length : 0;
  return xp + children * 10;
}

function isRelatedInAnyFamily(families, jidA, jidB) {
  const a = normalizeJid(jidA);
  const b = normalizeJid(jidB);

  return families.some((family) => {
    const members = familyMembers(family);
    return members.includes(a) && members.includes(b);
  });
}

async function ensureStore() {
  await fs.mkdir(DB_DIR, { recursive: true });

  await Promise.all([
    ensureFile(FAMILIES_FILE, []),
    ensureFile(PROPOSALS_FILE, []),
    ensureFile(HISTORY_FILE, []),
    ensureFile(CONFIG_FILE, DEFAULT_CONFIG),
  ]);
}

async function ensureFile(filePath, fallbackValue) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallbackValue, null, 2), "utf8");
  }
}

async function readJson(filePath, fallbackValue) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    if (!raw.trim()) return fallbackValue;
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT" || error.name === "SyntaxError") {
      await fs.writeFile(filePath, JSON.stringify(fallbackValue, null, 2), "utf8");
      return fallbackValue;
    }
    throw error;
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function loadState() {
  await ensureStore();

  const [families, proposals, history, config] = await Promise.all([
    readJson(FAMILIES_FILE, []),
    readJson(PROPOSALS_FILE, []),
    readJson(HISTORY_FILE, []),
    readJson(CONFIG_FILE, DEFAULT_CONFIG),
  ]);

  return {
    families: Array.isArray(families) ? families : [],
    proposals: Array.isArray(proposals) ? proposals : [],
    history: Array.isArray(history) ? history : [],
    config: { ...DEFAULT_CONFIG, ...(config || {}) },
  };
}

async function saveState(state) {
  await ensureStore();

  await Promise.all([
    writeJson(FAMILIES_FILE, state.families || []),
    writeJson(PROPOSALS_FILE, state.proposals || []),
    writeJson(HISTORY_FILE, state.history || []),
    writeJson(CONFIG_FILE, { ...DEFAULT_CONFIG, ...(state.config || {}) }),
  ]);
}

function normalizeJidList(list = []) {
  return [...new Set(list.map(normalizeJid).filter(Boolean))];
}

async function resolveCoinsForJid(jid) {
  const digits = normalizeJid(jid);

  for (const filePath of ECONOMY_CANDIDATES) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      if (!raw.trim()) continue;

      const data = JSON.parse(raw);
      const coins = extractCoinsFromUnknownShape(data, digits);
      if (coins !== null && coins !== undefined) return Number(coins) || 0;
    } catch {
      // ignora e tenta o próximo arquivo
    }
  }

  return 0;
}

function extractCoinsFromUnknownShape(data, digits, depth = 0) {
  if (depth > 5 || data == null) return null;

  if (Array.isArray(data)) {
    for (const item of data) {
      const found = extractCoinsFromUnknownShape(item, digits, depth + 1);
      if (found !== null && found !== undefined) return found;
    }
    return null;
  }

  if (typeof data === "object") {
    const recordIds = [
      data.jid,
      data.id,
      data.user,
      data.userId,
      data.number,
      data.phone,
      data.lid,
      data.whatsapp,
    ]
      .filter(Boolean)
      .map(normalizeJid);

    if (recordIds.includes(digits)) {
      const raw =
        data.coins ??
        data.coin ??
        data.balance ??
        data.money ??
        data.saldo ??
        0;
      const num = Number(raw);
      return Number.isFinite(num) ? num : 0;
    }

    for (const [key, value] of Object.entries(data)) {
      if (normalizeJid(key) === digits) {
        if (typeof value === "number") return value;
        if (value && typeof value === "object") {
          const raw =
            value.coins ??
            value.coin ??
            value.balance ??
            value.money ??
            value.saldo ??
            0;
          const num = Number(raw);
          if (Number.isFinite(num)) return num;
        }
      }

      const nested = extractCoinsFromUnknownShape(value, digits, depth + 1);
      if (nested !== null && nested !== undefined) return nested;
    }
  }

  return null;
}

export function familyToMentions(family) {
  const list = familyMembers(family).map((jid) => `${normalizeJid(jid)}@lid`);
  return [...new Set(list)].filter(Boolean);
}

export async function getActiveFamilies() {
  const state = await loadState();
  return state.families.filter(isActiveFamily);
}

export async function getFamilyByJid(jid) {
  const state = await loadState();
  return getActiveFamilyByJidFromState(state.families, jid);
}

export async function getCurrentFamilyByJid(jid) {
  return getFamilyByJid(jid);
}

export async function getLatestFamilyRecordByJid(jid) {
  const state = await loadState();
  return getLatestFamilyRecordByJidFromState(state.families, jid);
}

export async function getProfileByJid(jid) {
  const state = await loadState();
  const current = getActiveFamilyByJidFromState(state.families, jid);
  const latest = current || getLatestFamilyRecordByJidFromState(state.families, jid);

  const coins = await resolveCoinsForJid(jid);

  if (!latest) {
    return {
      family: null,
      role: "member",
      coins,
      familyStatus: "single",
    };
  }

  return {
    family: latest,
    role: getFamilyRole(latest, jid),
    coins,
    familyStatus: isActiveFamily(latest) ? "active" : "divorced",
  };
}

export async function createMarriageProposal(fromJid, toJid) {
  const state = await loadState();

  const from = normalizeJid(fromJid);
  const to = normalizeJid(toJid);

  if (!from || !to) throw new Error("Número inválido.");
  if (from === to) throw new Error("Você não pode casar consigo mesmo.");

  if (getActiveFamilyByJidFromState(state.families, from)) {
    throw new Error("Você já está em uma família ativa.");
  }

  if (getActiveFamilyByJidFromState(state.families, to)) {
    throw new Error("A outra pessoa já está em uma família ativa.");
  }

  if (isRelatedInAnyFamily(state.families, from, to)) {
    throw new Error("Você não pode casar com alguém da sua família, ex ou filho.");
  }

  const conflict = state.proposals.some((proposal) => {
    const pFrom = normalizeJid(proposal.from);
    const pTo = normalizeJid(proposal.to);
    return [pFrom, pTo].includes(from) || [pFrom, pTo].includes(to);
  });

  if (conflict) {
    throw new Error("Já existe um pedido pendente envolvendo uma dessas pessoas.");
  }

  const proposal = {
    id: uid("marriage"),
    type: "marriage",
    from,
    to,
    familyId: null,
    createdAt: now(),
  };

  state.proposals.push(proposal);
  await saveState(state);
  return proposal;
}

export async function createAdoptionProposal(fromJid, toJid) {
  const state = await loadState();

  const from = normalizeJid(fromJid);
  const to = normalizeJid(toJid);

  if (!from || !to) throw new Error("Número inválido.");
  if (from === to) throw new Error("Você não pode adotar a si mesmo.");

  const family = getActiveFamilyByJidFromState(state.families, from);
  if (!family) throw new Error("Você precisa estar em uma família ativa para adotar.");

  if (!isSpouseOfFamily(family, from)) {
    throw new Error("Apenas os responsáveis da família podem adotar.");
  }

  if (getActiveFamilyByJidFromState(state.families, to) || getLatestFamilyRecordByJidFromState(state.families, to)) {
    throw new Error("Essa pessoa já faz parte de uma família.");
  }

  if ((family.children || []).length >= Number(state.config.maxChildren || 5)) {
    throw new Error("Essa família já atingiu o limite de filhos.");
  }

  const conflict = state.proposals.some((proposal) => {
    const pFrom = normalizeJid(proposal.from);
    const pTo = normalizeJid(proposal.to);
    return [pFrom, pTo].includes(from) || [pFrom, pTo].includes(to);
  });

  if (conflict) {
    throw new Error("Já existe um pedido pendente envolvendo uma dessas pessoas.");
  }

  const proposal = {
    id: uid("adoption"),
    type: "adoption",
    from,
    to,
    familyId: family.id,
    createdAt: now(),
  };

  state.proposals.push(proposal);
  await saveState(state);
  return proposal;
}

export async function getPendingProposalFor(jid) {
  const state = await loadState();
  const target = normalizeJid(jid);
  return state.proposals.find((proposal) => normalizeJid(proposal.to) === target) || null;
}

export async function acceptPendingProposal(jid) {
  const state = await loadState();
  const target = normalizeJid(jid);

  const index = state.proposals.findIndex((proposal) => normalizeJid(proposal.to) === target);
  if (index < 0) throw new Error("Você não tem nenhum pedido pendente.");

  const proposal = state.proposals[index];
  const createdAt = now();

  if (proposal.type === "marriage") {
    if (getActiveFamilyByJidFromState(state.families, proposal.from)) {
      throw new Error("Quem enviou o pedido já está em uma família ativa.");
    }

    if (getActiveFamilyByJidFromState(state.families, proposal.to)) {
      throw new Error("Você já está em uma família ativa.");
    }

    if (isRelatedInAnyFamily(state.families, proposal.from, proposal.to)) {
      throw new Error("Esse casamento é inválido por parentesco.");
    }

    const family = {
      id: uid("family"),
      name: makeFamilyName(proposal.from, proposal.to),
      married: true,
      status: "active",
      spouses: normalizeJidList([proposal.from, proposal.to]),
      children: [],
      xp: 0,
      createdAt,
      updatedAt: createdAt,
    };

    state.families.push(family);
    state.history.push({
      id: uid("history"),
      familyId: family.id,
      type: "marriage",
      text: `Casamento realizado entre ${proposal.from} e ${proposal.to}.`,
      createdAt,
    });

    state.proposals.splice(index, 1);
    await saveState(state);

    return { type: "marriage", family, proposal };
  }

  if (proposal.type === "adoption") {
    const family = state.families.find(
      (item) => item.id === proposal.familyId && isActiveFamily(item),
    );

    if (!family) throw new Error("A família deste pedido não existe mais.");

    if (!isSpouseOfFamily(family, proposal.from)) {
      throw new Error("Só os responsáveis da família podem aceitar adoção.");
    }

    if (getLatestFamilyRecordByJidFromState(state.families, proposal.to) || getActiveFamilyByJidFromState(state.families, proposal.to)) {
      throw new Error("Essa pessoa já faz parte de uma família.");
    }

    if ((family.children || []).some((x) => normalizeJid(x) === target)) {
      throw new Error("Essa pessoa já é filha dessa família.");
    }

    if ((family.children || []).length >= Number(state.config.maxChildren || 5)) {
      throw new Error("Essa família já atingiu o limite de filhos.");
    }

    family.children = Array.isArray(family.children) ? family.children : [];
    family.children.push(target);
    family.updatedAt = createdAt;

    state.history.push({
      id: uid("history"),
      familyId: family.id,
      type: "adoption",
      text: `Adoção realizada: ${target} entrou na família ${family.name}.`,
      createdAt,
    });

    state.proposals.splice(index, 1);
    await saveState(state);

    return { type: "adoption", family, proposal, child: target };
  }

  throw new Error("Tipo de pedido desconhecido.");
}

export async function rejectPendingProposal(jid) {
  const state = await loadState();
  const target = normalizeJid(jid);

  const index = state.proposals.findIndex((proposal) => normalizeJid(proposal.to) === target);
  if (index < 0) throw new Error("Você não tem nenhum pedido pendente.");

  const proposal = state.proposals.splice(index, 1)[0];

  state.history.push({
    id: uid("history"),
    familyId: proposal.familyId || null,
    type: "rejection",
    text: `Pedido recusado do tipo ${proposal.type} para ${proposal.to}.`,
    createdAt: now(),
  });

  await saveState(state);
  return proposal;
}

export async function divorceFamilyByJid(jid) {
  const state = await loadState();
  const target = normalizeJid(jid);

  const family = getActiveSpouseFamilyByJidFromState(state.families, target);
  if (!family) throw new Error("Você não é um dos responsáveis de uma família ativa.");

  family.married = false;
  family.status = "divorced";
  family.divorcedAt = now();
  family.updatedAt = now();

  state.history.push({
    id: uid("history"),
    familyId: family.id,
    type: "divorce",
    text: `Divórcio registrado na família ${family.name}.`,
    createdAt: now(),
  });

  await saveState(state);
  return family;
}

export async function abandonChildFromFamily(parentJid, childJid) {
  const state = await loadState();
  const parent = normalizeJid(parentJid);
  const child = normalizeJid(childJid);

  const family = getFamilyRecordForAbandonFromState(state.families, parent, child);
  if (!family) {
    throw new Error("Não encontrei uma família onde você seja responsável e essa pessoa seja seu filho.");
  }

  family.children = (family.children || []).filter((x) => normalizeJid(x) !== child);
  family.updatedAt = now();

  state.history.push({
    id: uid("history"),
    familyId: family.id,
    type: "abandon",
    text: `${child} saiu da família ${family.name}.`,
    createdAt: now(),
  });

  await saveState(state);
  return family;
}

export async function getFamilyRanking() {
  const state = await loadState();
  const activeFamilies = state.families.filter(isActiveFamily);

  return [...activeFamilies]
    .sort((a, b) => {
      const scoreB = getFamilyScore(b);
      const scoreA = getFamilyScore(a);
      if (scoreB !== scoreA) return scoreB - scoreA;

      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB;
    })
    .map((family, index) => ({
      ...family,
      rank: index + 1,
      score: getFamilyScore(family),
    }));
}

export async function getFamilyHistoryForJid(jid) {
  const state = await loadState();
  const target = normalizeJid(jid);

  const familyIds = state.families
    .filter((family) => isMemberOfFamily(family, target))
    .map((family) => family.id);

  const entries = state.history.filter((item) => familyIds.includes(item.familyId));

  if (entries.length) return entries.slice(-10);
  return state.history.slice(-10);
}

export function buildFamilyText(family) {
  const spouses = Array.isArray(family?.spouses) ? family.spouses : [];
  const children = Array.isArray(family?.children) ? family.children : [];
  const isActive = isActiveFamily(family);
  const spouseLabel = isActive ? "𝐂𝐎𝐍𝐉𝐔𝐆𝐄𝐒" : "𝐄𝐗-𝐂𝐎𝐍𝐉𝐔𝐆𝐄𝐒";
  const status = isActive ? "Ativa" : "Divorciada";

  const spouseText = spouses.length
    ? spouses.map((jid) => `• @${normalizeJid(jid)}`).join("\n")
    : "• nenhum";

  const childrenText = children.length
    ? children.map((jid) => `• @${normalizeJid(jid)}`).join("\n")
    : "• nenhum";

  return `╭━━━━━━━━━━━━━⛓️
│ 『 ${family?.name || "Família"} 』
│
│ ❤️ 𝐒𝐓𝐀𝐓𝐔𝐒 :: ${status}
│ 🆔 𝐈𝐃 :: ${family?.id || "-"}
│ 📅 𝐂𝐑𝐈𝐀𝐃𝐀 :: ${formatDateBR(family?.createdAt)}
│ ⏳ 𝐃𝐈𝐀𝐒 :: ${daysSince(family?.createdAt)}
│ ⭐ 𝐗𝐏 :: ${family?.xp || 0}
│
│ 💍 ${spouseLabel}
│ ${spouseText}
│
│ 👶 𝐅𝐈𝐋𝐇𝐎𝐒
│ ${childrenText}
╰━━━━━━━━━━━━━━━━━━`;
}

export function buildProfileText(profile, jid) {
  const family = profile?.family;
  const role = profile?.role || "member";
  const spouseCount = Array.isArray(family?.spouses) ? family.spouses.length : 0;
  const childCount = Array.isArray(family?.children) ? family.children.length : 0;
  const coins = Number(profile?.coins || 0);
  const familyState =
    profile?.familyStatus === "active"
      ? "Casado(a)"
      : profile?.familyStatus === "divorced"
        ? "Divorciado(a)"
        : "Solteiro(a)";

  return `╭━━━━━━━━━━━━━⛓️
│ 『 PERFIL FAMÍLIA 』
│
│ 👤 𝐔𝐒𝐔Á𝐑𝐈𝐎 :: @${normalizeJid(jid)}
│ 🧷 𝐏𝐀𝐏𝐄𝐋 :: ${role}
│ ❤️ 𝐒𝐓𝐀𝐓𝐔𝐒 :: ${familyState}
│ 🏠 𝐅𝐀𝐌Í𝐋𝐈𝐀 :: ${family?.name || "Sem família"}
│ 💰 𝐂𝐎𝐈𝐍𝐒 :: ${formatCoins(coins)}
│ 💍 𝐂𝐎𝐍𝐉𝐔𝐆𝐄𝐒 :: ${spouseCount}
│ 👶 𝐅𝐈𝐋𝐇𝐎𝐒 :: ${childCount}
│ 📅 𝐂𝐑𝐈𝐀𝐃𝐀 :: ${formatDateBR(family?.createdAt)}
╰━━━━━━━━━━━━━━━━━━`;
}

export function buildRankingText(ranking = []) {
  const lines = ranking.slice(0, 10).map((family, index) => {
    const spouses = (family.spouses || []).map((jid) => `@${normalizeJid(jid)}`).join(" ❤️ ");
    const children = Array.isArray(family.children) ? family.children.length : 0;
    return `【 ${index + 1} 】 ${family.name}
💍 ${spouses || "-"}
👶 Filhos: ${children}
⭐ XP: ${family.score || 0}`;
  });

  return `╭━━━━━━━━━━━━━⛓️
│ 『 RANKING FAMÍLIAS 』
│
${lines.length ? lines.map((line) => `│ ${line.replace(/\n/g, "\n│ ")}`).join("\n│\n") : "│ Sem famílias registradas."}
╰━━━━━━━━━━━━━━━━━━`;
}

export function buildHistoryText(entries = []) {
  const lines = entries.slice(-10).map((entry, index) => {
    return `【 ${index + 1} 】 ${entry.type}
📝 ${entry.text}
📅 ${formatDateBR(entry.createdAt)}`;
  });

  return `╭━━━━━━━━━━━━━⛓️
│ 『 HISTÓRICO FAMÍLIA 』
│
${lines.length ? lines.map((line) => `│ ${line.replace(/\n/g, "\n│ ")}`).join("\n│\n") : "│ Nenhum histórico encontrado."}
╰━━━━━━━━━━━━━━━━━━`;
}

export function buildShipText(jidA, jidB, score) {
  const bar = "█".repeat(Math.max(0, Math.round(score / 10))) + "░".repeat(Math.max(0, 10 - Math.round(score / 10)));

  return `╭━━━━━━━━━━━━━⛓️
│ 『 SHIP 』
│
│ 👤 A :: @${normalizeJid(jidA)}
│ 👤 B :: @${normalizeJid(jidB)}
│ ❤️ Compatibilidade :: ${score}%
│ ${bar}
╰━━━━━━━━━━━━━━━━━━`;
}