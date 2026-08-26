import { ensureRecord, readJson, writeJson } from "./_helpers.js";

const FILE = "market.json";

const DEFAULT = {
  lastUpdate: 0,
  skins: [],
  items: [],
  services: [],
};

export function getMarket() {
  const db = readJson(FILE, {});
  const record = ensureRecord(db, "global", DEFAULT);
  writeJson(FILE, db);
  return record;
}

export function setMarket(data) {
  const db = readJson(FILE, {});
  db.global = data;
  writeJson(FILE, db);
  return db.global;
}