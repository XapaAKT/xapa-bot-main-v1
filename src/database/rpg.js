import fs from "node:fs";
import path from "node:path";
import { DATABASE_DIR } from "../config.js";

const RPG_DIR = path.join(DATABASE_DIR, "rpg");
const USERS_FILE = path.join(RPG_DIR, "users.json");

const DEFAULT_PLAYER = {
  coins: 0,
  xp: 0,
  level: 1,
  inventory: {
    resources: {},
    items: {},
  },
  tools: {
    pickaxe: { level: 1, durability: 100 },
    axe: { level: 1, durability: 100 },
    rod: { level: 1, durability: 100 },
    weapon: { level: 1, durability: 100 },
  },
  skins: {
    owned: ["padrao"],
    equipped: "padrao",
  },
  stats: {
    mining: 0,
    woodcutting: 0,
    hunting: 0,
    fishing: 0,
    sales: 0,
    wins: 0,
    losses: 0,
  },
};

function ensureRpgDir() {
  if (!fs.existsSync(RPG_DIR)) {
    fs.mkdirSync(RPG_DIR, { recursive: true });
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readUsers() {
  ensureRpgDir();

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "{}", "utf8");
  }

  const raw = fs.readFileSync(USERS_FILE, "utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

function saveUsers(data) {
  ensureRpgDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), "utf8");
}

export function ensurePlayer(userId) {
  const users = readUsers();

  if (!users[userId]) {
    users[userId] = clone(DEFAULT_PLAYER);
    saveUsers(users);
  }

  return users[userId];
}

export function getPlayer(userId) {
  const users = readUsers();
  return users[userId] || ensurePlayer(userId);
}

export function updatePlayer(userId, updater) {
  const users = readUsers();
  const current = users[userId] ? users[userId] : clone(DEFAULT_PLAYER);

  const updated = typeof updater === "function" ? updater(current) : updater;
  users[userId] = updated;

  saveUsers(users);
  return users[userId];
}

export function formatCoins(value) {
  return Number(value || 0).toLocaleString("pt-BR");
}

export function addCoins(userId, amount) {
  return updatePlayer(userId, (player) => {
    player.coins += Math.max(0, Math.floor(Number(amount) || 0));
    return player;
  });
}

export function removeCoins(userId, amount) {
  return updatePlayer(userId, (player) => {
    player.coins -= Math.max(0, Math.floor(Number(amount) || 0));
    if (player.coins < 0) player.coins = 0;
    return player;
  });
}

export function addXp(userId, amount) {
  return updatePlayer(userId, (player) => {
    player.xp += Math.max(0, Math.floor(Number(amount) || 0));

    while (player.xp >= player.level * 100) {
      player.xp -= player.level * 100;
      player.level += 1;
    }

    return player;
  });
}

export function addResource(userId, key, amount) {
  return updatePlayer(userId, (player) => {
    if (player.inventory.resources[key] === undefined) {
      player.inventory.resources[key] = 0;
    }

    player.inventory.resources[key] += Math.max(0, Math.floor(Number(amount) || 0));
    return player;
  });
}

export function removeResource(userId, key, amount) {
  return updatePlayer(userId, (player) => {
    if (player.inventory.resources[key] === undefined) {
      player.inventory.resources[key] = 0;
    }

    player.inventory.resources[key] -= Math.max(0, Math.floor(Number(amount) || 0));
    if (player.inventory.resources[key] < 0) player.inventory.resources[key] = 0;

    return player;
  });
}

export function addItem(userId, key, amount) {
  return updatePlayer(userId, (player) => {
    if (player.inventory.items[key] === undefined) {
      player.inventory.items[key] = 0;
    }

    player.inventory.items[key] += Math.max(0, Math.floor(Number(amount) || 0));
    return player;
  });
}

export function removeItem(userId, key, amount) {
  return updatePlayer(userId, (player) => {
    if (player.inventory.items[key] === undefined) {
      player.inventory.items[key] = 0;
    }

    player.inventory.items[key] -= Math.max(0, Math.floor(Number(amount) || 0));
    if (player.inventory.items[key] < 0) player.inventory.items[key] = 0;

    return player;
  });
}

export function getTool(userId, toolName) {
  const player = getPlayer(userId);
  return player.tools?.[toolName] || { level: 1, durability: 100 };
}

export function setToolLevel(userId, toolName, level) {
  return updatePlayer(userId, (player) => {
    if (!player.tools[toolName]) {
      player.tools[toolName] = { level: 1, durability: 100 };
    }

    player.tools[toolName].level = Math.max(1, Math.min(7, Math.floor(Number(level) || 1)));
    return player;
  });
}

export function damageTool(userId, toolName, amount = 1) {
  return updatePlayer(userId, (player) => {
    if (!player.tools[toolName]) {
      player.tools[toolName] = { level: 1, durability: 100 };
    }

    player.tools[toolName].durability -= Math.max(0, Math.floor(Number(amount) || 0));
    if (player.tools[toolName].durability < 0) player.tools[toolName].durability = 0;
    return player;
  });
}

export function repairTool(userId, toolName) {
  return updatePlayer(userId, (player) => {
    if (!player.tools[toolName]) {
      player.tools[toolName] = { level: 1, durability: 100 };
    }

    player.tools[toolName].durability = 100;
    return player;
  });
}

export function addSkin(userId, skinId) {
  return updatePlayer(userId, (player) => {
    if (!player.skins.owned.includes(skinId)) {
      player.skins.owned.push(skinId);
    }
    return player;
  });
}

export function equipSkin(userId, skinId) {
  const player = getPlayer(userId);
  if (!player.skins.owned.includes(skinId)) return false;

  updatePlayer(userId, (current) => {
    current.skins.equipped = skinId;
    return current;
  });

  return true;
}