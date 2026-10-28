import { ensureRecord, readJson, writeJson } from "./_helpers.js";

const FILE = "profile.json";

const DEFAULT = {
  description: "Ainda nao defini uma descricao.",
  font: "moderna",
  theme: "neon",
  background: "",
  pokedolars: 0,
  xp: 0,
  level: 1,
  mining: 0,
  woodcutting: 0,
  hunting: 0,
  fishing: 0,
  wins: 0,
  losses: 0,
};

export function getProfile(userId) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  writeJson(FILE, db);
  return record;
}

export function updateProfile(userId, changes) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);

  Object.assign(record, changes);
  writeJson(FILE, db);
  return record;
}

export function addXp(userId, amount) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  const value = Math.max(0, Math.floor(Number(amount) || 0));

  record.xp += value;

  while (record.xp >= record.level * 100) {
    record.xp -= record.level * 100;
    record.level += 1;
  }

  writeJson(FILE, db);
  return record;
}

export function addStat(userId, statName, amount = 1) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  const value = Math.max(0, Math.floor(Number(amount) || 0));

  if (record[statName] === undefined) record[statName] = 0;
  record[statName] += value;

  writeJson(FILE, db);
  return record[statName];
}