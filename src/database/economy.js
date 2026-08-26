import { ensureRecord, readJson, writeJson } from "./_helpers.js";

const FILE = "economy.json";

const DEFAULT = {
  coins: 0,
  totalEarned: 0,
  totalSpent: 0,
};

export function getEconomy(userId) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  writeJson(FILE, db);
  return record;
}

export function getCoins(userId) {
  return getEconomy(userId).coins;
}

export function setCoins(userId, amount) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  const value = Math.max(0, Math.floor(Number(amount) || 0));

  record.coins = value;
  writeJson(FILE, db);

  return record.coins;
}

export function addCoins(userId, amount) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  const value = Math.max(0, Math.floor(Number(amount) || 0));

  record.coins += value;
  record.totalEarned += value;

  writeJson(FILE, db);
  return record.coins;
}

export function removeCoins(userId, amount) {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, userId, DEFAULT);
  const value = Math.max(0, Math.floor(Number(amount) || 0));

  record.coins -= value;
  if (record.coins < 0) record.coins = 0;

  record.totalSpent += value;

  writeJson(FILE, db);
  return record.coins;
}

export function hasCoins(userId, amount) {
  return getCoins(userId) >= Math.max(0, Math.floor(Number(amount) || 0));
}