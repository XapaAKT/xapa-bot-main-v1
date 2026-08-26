import { ensureRecord, readJson, writeJson } from "./_helpers.js";

const FILE = "inventory.json";

const DEFAULT = {
  resources: {},
  items: {},
};

export function getInventory(userId) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  writeJson(FILE, db);
  return record;
}

export function getResource(userId, key) {
  const inv = getInventory(userId);
  return Number(inv.resources?.[key] || 0);
}

export function addResource(userId, key, amount) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  const value = Math.max(0, Math.floor(Number(amount) || 0));

  if (record.resources[key] === undefined) record.resources[key] = 0;
  record.resources[key] += value;

  writeJson(FILE, db);
  return record.resources[key];
}

export function removeResource(userId, key, amount) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  const value = Math.max(0, Math.floor(Number(amount) || 0));

  if (record.resources[key] === undefined) record.resources[key] = 0;
  record.resources[key] -= value;

  if (record.resources[key] < 0) record.resources[key] = 0;

  writeJson(FILE, db);
  return record.resources[key];
}

export function addItem(userId, key, amount) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  const value = Math.max(0, Math.floor(Number(amount) || 0));

  if (record.items[key] === undefined) record.items[key] = 0;
  record.items[key] += value;

  writeJson(FILE, db);
  return record.items[key];
}

export function removeItem(userId, key, amount) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  const value = Math.max(0, Math.floor(Number(amount) || 0));

  if (record.items[key] === undefined) record.items[key] = 0;
  record.items[key] -= value;

  if (record.items[key] < 0) record.items[key] = 0;

  writeJson(FILE, db);
  return record.items[key];
}