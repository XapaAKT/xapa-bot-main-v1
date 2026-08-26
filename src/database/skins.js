import { ensureRecord, readJson, writeJson } from "./_helpers.js";

const FILE = "skins.json";

const DEFAULT = {
  owned: ["padrao"],
  equipped: "padrao",
};

export function getSkins(userId) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  writeJson(FILE, db);
  return record;
}

export function hasSkin(userId, skinId) {
  const skins = getSkins(userId);
  return skins.owned.includes(skinId);
}

export function addSkin(userId, skinId) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);

  if (!record.owned.includes(skinId)) {
    record.owned.push(skinId);
  }

  writeJson(FILE, db);
  return record.owned;
}

export function equipSkin(userId, skinId) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);

  if (!record.owned.includes(skinId)) {
    return false;
  }

  record.equipped = skinId;
  writeJson(FILE, db);
  return true;
}