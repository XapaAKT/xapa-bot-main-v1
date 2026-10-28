import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DATABASE_DIR = path.dirname(fileURLToPath(import.meta.url));

function getFilePath(fileName) {
  return path.join(DATABASE_DIR, fileName);
}

export function readJson(fileName, fallbackValue) {
  const filePath = getFilePath(fileName);

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw.trim()) return fallbackValue;
    return JSON.parse(raw);
  } catch (error) {
    if (error.code !== "ENOENT" && error.name !== "SyntaxError") {
      throw error;
    }

    fs.writeFileSync(filePath, JSON.stringify(fallbackValue, null, 2), "utf8");
    return fallbackValue;
  }
}

export function writeJson(fileName, data) {
  fs.writeFileSync(
    getFilePath(fileName),
    JSON.stringify(data, null, 2),
    "utf8",
  );
}

export function ensureRecord(database, userId, defaults) {
  const key = String(userId || "").trim();
  if (!key) {
    throw new Error("ID de usuario inválido para o banco de dados.");
  }

  if (!database[key] || typeof database[key] !== "object") {
    database[key] = structuredClone(defaults);
  } else {
    database[key] = { ...structuredClone(defaults), ...database[key] };
  }

  return database[key];
}
