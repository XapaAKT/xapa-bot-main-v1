import { ensureRecord, readJson, writeJson } from "./_helpers.js";

const FILE = "tools.json";

const DEFAULT = {
  pickaxe: { level: 1, durability: 100, xp: 0 },
  axe: { level: 1, durability: 100, xp: 0 },
  rod: { level: 1, durability: 100, xp: 0 },
  weapon: { level: 1, durability: 100, xp: 0 },
};

const MAX_LEVEL = 7;

export function getTools(userId) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  writeJson(FILE, db);
  return record;
}

export function getTool(userId, toolName) {
  const tools = getTools(userId);
  return tools[toolName];
}

export function setToolLevel(userId, toolName, level) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);

  if (!record[toolName]) {
    record[toolName] = { level: 1, durability: 100, xp: 0 };
  }

  record[toolName].level = Math.min(MAX_LEVEL, Math.max(1, Math.floor(Number(level) || 1)));

  writeJson(FILE, db);
  return record[toolName].level;
}

export function levelUpTool(userId, toolName) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);

  if (!record[toolName]) {
    record[toolName] = { level: 1, durability: 100, xp: 0 };
  }

  if (record[toolName].level < MAX_LEVEL) {
    record[toolName].level += 1;
  }

  writeJson(FILE, db);
  return record[toolName].level;
}

export function damageTool(userId, toolName, amount = 1) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  const value = Math.max(0, Math.floor(Number(amount) || 0));

  if (!record[toolName]) {
    record[toolName] = { level: 1, durability: 100, xp: 0 };
  }

  record[toolName].durability -= value;
  if (record[toolName].durability < 0) record[toolName].durability = 0;

  writeJson(FILE, db);
  return record[toolName].durability;
}

export function repairTool(userId, toolName) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);

  if (!record[toolName]) {
    record[toolName] = { level: 1, durability: 100, xp: 0 };
  }

  record[toolName].durability = 100;
  writeJson(FILE, db);
  return record[toolName].durability;
}