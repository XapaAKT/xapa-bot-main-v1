import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "groupActivity.json");

const REGISTRATION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 horas
const AFK_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 dias

let data = {
  groups: {}
};

let loaded = false;

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify(data, null, 2),
      "utf8"
    );
  }
}

async function load() {
  if (loaded) return;

  await ensureDataFile();

  try {
    const content = await fs.readFile(DATA_FILE, "utf8");

    data = JSON.parse(content);

    if (!data.groups) {
      data.groups = {};
    }
  } catch (error) {
    console.error("[AFK MANAGER] Erro ao carregar banco:", error);

    data = {
      groups: {}
    };
  }

  loaded = true;
}

let saveQueue = Promise.resolve();

function save() {
  saveQueue = saveQueue
    .catch(() => {})
    .then(async () => {
      await ensureDataFile();

      await fs.writeFile(
        DATA_FILE,
        JSON.stringify(data, null, 2),
        "utf8"
      );
    });

  return saveQueue;
}

function ensureGroup(groupId) {
  if (!data.groups[groupId]) {
    data.groups[groupId] = {
      members: {}
    };
  }

  if (!data.groups[groupId].members) {
    data.groups[groupId].members = {};
  }

  return data.groups[groupId];
}

/**
 * Quando alguém entra no grupo.
 */
export async function markMemberJoined(groupId, jid) {
  await load();

  const group = ensureGroup(groupId);
  const now = Date.now();

  group.members[jid] = {
    joinedAt: now,
    lastMessage: now,
    registered: false
  };

  await save();
}

/**
 * Quando alguém manda mensagem.
 */
export async function touchMember(groupId, jid) {
  await load();

  const group = ensureGroup(groupId);

  if (!group.members[jid]) {
    group.members[jid] = {
      joinedAt: Date.now(),
      lastMessage: Date.now(),
      registered: false
    };
  } else {
    group.members[jid].lastMessage = Date.now();
  }

  await save();
}

/**
 * ADM confirma que o membro se registrou.
 */
export async function markRegistered(groupId, jid) {
  await load();

  const group = ensureGroup(groupId);

  if (!group.members[jid]) {
    group.members[jid] = {
      joinedAt: Date.now(),
      lastMessage: Date.now(),
      registered: true
    };
  } else {
    group.members[jid].registered = true;
    group.members[jid].lastMessage = Date.now();
  }

  await save();
}

/**
 * Remove membro do controle.
 */
export async function removeMember(groupId, jid) {
  await load();

  const group = ensureGroup(groupId);

  delete group.members[jid];

  await save();
}

/**
 * Lista membros que estão AFK.
 */
export async function listAfkMembers(groupId) {
  await load();

  const group = ensureGroup(groupId);
  const now = Date.now();

  return Object.entries(group.members)
    .filter(([, member]) => {
      return (
        now - member.lastMessage >= AFK_TIMEOUT
      );
    })
    .map(([jid, member]) => ({
      jid,
      ...member
    }));
}

/**
 * Lista membros que ainda não foram registrados
 * e passaram das 24 horas.
 */
export async function listUnregisteredMembers(groupId) {
  await load();

  const group = ensureGroup(groupId);
  const now = Date.now();

  return Object.entries(group.members)
    .filter(([, member]) => {
      return (
        !member.registered &&
        now - member.joinedAt >= REGISTRATION_TIMEOUT
      );
    })
    .map(([jid, member]) => ({
      jid,
      ...member
    }));
}

/**
 * Todos os grupos.
 */
export async function getGroups() {
  await load();

  return data.groups;
}

export {
  REGISTRATION_TIMEOUT,
  AFK_TIMEOUT
};