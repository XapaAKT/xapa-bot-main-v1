import { ensureRecord, readJson, writeJson } from "./_helpers.js";

const FILE = "cooldowns.json";

const DEFAULT = {
  mining: 0,
  woodcutting: 0,
  hunting: 0,
  fishing: 0,
  shop: 0,
};

export function getCooldowns(userId) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  writeJson(FILE, db);
  return record;
}

export function setCooldown(userId, action, timestamp) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);

  record[action] = Number(timestamp) || 0;

  writeJson(FILE, db);
  return record[action];
}

export function canUse(userId, action) {
  const cooldowns = getCooldowns(userId);
  return (Number(cooldowns[action]) || 0) <= Date.now();
}

export function remainingCooldown(userId, action) {
  const cooldowns = getCooldowns(userId);
  const remaining = (Number(cooldowns[action]) || 0) - Date.now();
  return remaining > 0 ? remaining : 0;
}