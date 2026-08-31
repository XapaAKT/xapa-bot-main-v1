import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const DB_DIR = path.resolve(ROOT_DIR, "database");
const CATALOG_FILE = path.join(DB_DIR, "pokemons.json");
const STATE_FILE = path.join(DB_DIR, "pokemonState.json");

const POKEMON_IMAGES_DIR = path.resolve(ROOT_DIR, "assets", "images", "pokemon");

const DEFAULT_STATE = {
  users: {},
};

const PACK_PRICES = {
  common: 5000,
  rare: 18000,
  epic: 50000,
  legendary: 120000,
};

const PACK_RARITY_POOLS = {
  common: ["comum", "incomum", "common", "uncommon"],
  rare: ["raro", "rare", "epico", "epic"],
  epic: ["epico", "epic", "lendario", "legendario", "legendary"],
  legendary: ["lendario", "legendario", "legendary"],
};

const FISH_COOLDOWN_MS = 5 * 60 * 1000;

function now() {
  return Date.now();
}

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeJid(value = "") {
  return String(value).replace(/\D/g, "");
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatBRL(value = 0) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

function pickRandom(list = []) {
  if (!Array.isArray(list) || !list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createDefaultUser() {
  return {
    coins: 0,
    packs: {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    },
    pokemons: [],
    fishingCount: 0,
    lastFishingAt: 0,
    stats: {
      nothing: 0,
      money: 0,
      packs: 0,
      pokemons: 0,
      sold: 0,
    },
  };
}

async function ensureFile(filePath, fallbackValue) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(fallbackValue, null, 2), "utf8");
  }
}

async function readJson(filePath, fallbackValue) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    if (!raw.trim()) return fallbackValue;
    return JSON.parse(raw);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallbackValue, null, 2), "utf8");
    return fallbackValue;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function loadCatalog() {
  await ensureFile(CATALOG_FILE, []);
  const catalog = await readJson(CATALOG_FILE, []);
  return Array.isArray(catalog) ? catalog : [];
}

async function loadState() {
  await ensureFile(STATE_FILE, DEFAULT_STATE);
  const state = await readJson(STATE_FILE, DEFAULT_STATE);
  if (!state.users || typeof state.users !== "object") {
    state.users = {};
  }
  return state;
}

async function saveState(state) {
  await writeJson(STATE_FILE, state);
}

function getUser(state, jid) {
  const key = normalizeJid(jid);
  if (!state.users[key]) {
    state.users[key] = createDefaultUser();
  }

  const user = state.users[key];
  user.coins = Number(user.coins) || 0;
  user.packs = { ...createDefaultUser().packs, ...(user.packs || {}) };
  user.pokemons = Array.isArray(user.pokemons) ? user.pokemons : [];
  user.stats = { ...createDefaultUser().stats, ...(user.stats || {}) };
  user.fishingCount = Number(user.fishingCount) || 0;
  user.lastFishingAt = Number(user.lastFishingAt) || 0;

  return user;
}

function normalizePackType(value = "") {
  const v = normalizeText(value);

  if (["comum", "common", "c"].includes(v)) return "common";
  if (["raro", "rare", "r"].includes(v)) return "rare";
  if (["epico", "epic", "e"].includes(v)) return "epic";
  if (["lendario", "legendario", "legendary", "l"].includes(v)) return "legendary";

  return null;
}

function rarityMatches(pokemonRarity = "", allowed = []) {
  const rarity = normalizeText(pokemonRarity);
  return allowed.some((item) => normalizeText(item) === rarity);
}

function drawPokemon(catalog, allowedRarities = null) {
  let pool = Array.isArray(catalog) ? catalog : [];

  if (allowedRarities?.length) {
    const filtered = pool.filter((pokemon) =>
      rarityMatches(pokemon.raridade || pokemon.rarity || "", allowedRarities)
    );
    pool = filtered;
  }

  return pickRandom(pool);
}

function resolvePokemonImagePath(pokemon) {
  const fileName =
    pokemon?.imagem ||
    pokemon?.image ||
    `${normalizeText(pokemon?.nome || pokemon?.name || "pokemon").replace(/\s+/g, "_")}.webp`;

  return path.resolve(POKEMON_IMAGES_DIR, fileName);
}

function addPokemonToUser(user, pokemon, source = "fishing") {
  const entry = {
    uid: uid("poke"),
    id: pokemon.id ?? null,
    name: pokemon.nome || pokemon.name || "Pokémon",
    rarity: pokemon.raridade || pokemon.rarity || "comum",
    value: Number(pokemon.valor ?? pokemon.value ?? 0) || 0,
    image: pokemon.imagem || pokemon.image || null,
    source,
    caughtAt: new Date().toISOString(),
  };

  user.pokemons.push(entry);
  user.stats.pokemons += 1;

  return entry;
}

function getBestPokemon(collection = []) {
  if (!collection.length) return null;
  return [...collection].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))[0];
}

export function buildShopText() {
  return `╭━━━━━━━━━━━━━⛓️
│ 『 LOJA POKÉMON 』
│
│ 📦 Pack Comum     :: ${formatBRL(PACK_PRICES.common)}
│ 📦 Pack Raro      :: ${formatBRL(PACK_PRICES.rare)}
│ 📦 Pack Épico     :: ${formatBRL(PACK_PRICES.epic)}
│ 📦 Pack Lendário  :: ${formatBRL(PACK_PRICES.legendary)}
│
│ Use:
│ /comprarpack comum 1
│ /comprarpack raro 2
│ /abrirpack comum
╰━━━━━━━━━━━━━━━━━━`;
}

export function buildCollectionText(user, jid) {
  const collection = Array.isArray(user?.pokemons) ? user.pokemons : [];
  const bestPokemon = getBestPokemon(collection);
  const totalValue = collection.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
  const rarityCounts = collection.reduce((counts, item) => {
    const rarity = item.rarity || "comum";
    counts[rarity] = (counts[rarity] || 0) + 1;
    return counts;
  }, {});

  const lines = collection.length
    ? collection.slice(0, 20).map((item, index) => {
        return `【 ${index + 1} 】 ${item.name} (${item.rarity})
💰 ${formatBRL(item.value)}
📅 ${item.caughtAt ? new Date(item.caughtAt).toLocaleString("pt-BR") : "-"}`;
      })
    : ["Sem pokémons na coleção."];

  return `╭━━━━━━━━━━━━━⛓️
│ 『 COLEÇÃO POKÉMON 』
│
│ 👤 𝐔𝐒𝐔Á𝐑𝐈𝐎 :: @${normalizeJid(jid)}
│ 💰 𝐂𝐎𝐈𝐍𝐒 :: ${formatBRL(user?.coins || 0)}
│ 📦 𝐏𝐀𝐂𝐊𝐒 :: C:${user?.packs?.common || 0} R:${user?.packs?.rare || 0} E:${user?.packs?.epic || 0} L:${user?.packs?.legendary || 0}
│ 🧩 𝐏𝐎𝐊É𝐌𝐎𝐍𝐒 :: ${collection.length}
│ 💎 𝐕𝐀𝐋𝐎𝐑 𝐓𝐎𝐓𝐀𝐋 :: ${formatBRL(totalValue)}
│ ⭐ 𝐌𝐀𝐈𝐒 𝐕𝐀𝐋𝐈𝐎𝐒𝐎 :: ${bestPokemon?.name || "-"}
│ 📊 𝐑𝐀𝐑𝐈𝐃𝐀𝐃𝐄𝐒 :: C:${rarityCounts.comum || 0} I:${rarityCounts.incomum || 0} R:${rarityCounts.raro || 0} E:${rarityCounts.epico || 0} L:${rarityCounts.lendario || 0}
│
${lines.map((line) => `│ ${line.replace(/\n/g, "\n│ ")}`).join("\n│\n")}
╰━━━━━━━━━━━━━━━━━━`;
}

export function buildPokedexText(catalog = [], collection = [], jid = "") {
  const ownedCounts = collection.reduce((counts, item) => {
    const key = item.id || normalizeText(item.name);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const entries = catalog.map((pokemon) => {
    const key = pokemon.id || normalizeText(pokemon.nome || pokemon.name);
    const name = pokemon.nome || pokemon.name || "Pokémon";
    const rarity = pokemon.raridade || pokemon.rarity || "comum";
    const value = Number(pokemon.valor ?? pokemon.value ?? 0) || 0;
    return `│ ${ownedCounts[key] ? "✅" : "⬜"} ${name} (${rarity}) :: ${ownedCounts[key] || 0}x :: ${formatBRL(value)}`;
  });

  return `╭━━━━━━━━━━━━━⛓️
│ 『 POKÉDEX XAPA 』
│ 👤 @${normalizeJid(jid)}
│ ✅ Descobertos: ${Object.keys(ownedCounts).filter((key) => ownedCounts[key] > 0).length}/${catalog.length}
│
${entries.length ? entries.join("\n") : "│ Nenhum Pokémon cadastrado."}
╰━━━━━━━━━━━━━━━━━━`;
}

export async function buyPack(jid, packTypeInput, amountInput = 1) {
  const packType = normalizePackType(packTypeInput);
  if (!packType) {
    throw new Error("Pack inválido. Use: comum, raro, épico ou lendário.");
  }

  const amountText = String(amountInput).trim();
  if (!/^\d+$/.test(amountText) || Number(amountText) < 1 || Number(amountText) > 100) {
    throw new Error("A quantidade deve ser um número inteiro entre 1 e 100.");
  }

  const amount = Number(amountText);
  const price = (PACK_PRICES[packType] || 0) * amount;

  const state = await loadState();
  const user = getUser(state, jid);

  if ((user.coins || 0) < price) {
    throw new Error(`Você precisa de ${formatBRL(price)} para comprar esse pack.`);
  }

  user.coins -= price;
  user.packs[packType] += amount;

  await saveState(state);

  return {
    packType,
    amount,
    price,
    remainingCoins: user.coins,
  };
}

export async function openPack(jid, packTypeInput, amountInput = 1) {
  const packType = normalizePackType(packTypeInput);
  if (!packType) {
    throw new Error("Pack inválido. Use: comum, raro, épico ou lendário.");
  }

  const state = await loadState();
  const catalog = await loadCatalog();
  const user = getUser(state, jid);

  const amount = Number(amountInput);
  if (!Number.isInteger(amount) || amount < 1 || amount > 10) {
    throw new Error("Você pode abrir entre 1 e 10 packs por vez.");
  }

  if ((user.packs[packType] || 0) < amount) {
    throw new Error(`Você precisa ter ${amount} packs do tipo ${packType}.`);
  }

  const caught = [];
  for (let index = 0; index < amount; index += 1) {
    const pokemon = drawPokemon(catalog, PACK_RARITY_POOLS[packType]);
    if (!pokemon) {
      throw new Error("Não há pokémons cadastrados em pokemons.json.");
    }

    user.packs[packType] -= 1;
    caught.push(addPokemonToUser(user, pokemon, `pack:${packType}`));
  }

  user.stats.packs += amount;

  await saveState(state);

  return {
    packType,
    amount,
    pokemons: caught,
    pokemon: caught[0],
    imagePath: resolvePokemonImagePath(caught[0]),
  };
}

export async function fishPokemon(jid) {
  const state = await loadState();
  const catalog = await loadCatalog();
  const user = getUser(state, jid);

  const elapsed = now() - (user.lastFishingAt || 0);
  if (elapsed < FISH_COOLDOWN_MS) {
    const remain = FISH_COOLDOWN_MS - elapsed;
    const seconds = Math.ceil(remain / 1000);
    throw new Error(`Você precisa esperar ${seconds}s para pescar novamente.`);
  }

  user.lastFishingAt = now();
  user.fishingCount += 1;

  const roll = Math.random() * 100;

  let result = {
    type: "nothing",
    message: "🎣 Você pescou... e não pegou nada dessa vez.",
  };

  if (roll < 38) {
    user.stats.nothing += 1;
  } else if (roll < 73) {
    const coins = randomInt(200, 1200);
    user.coins += coins;
    user.stats.money += coins;
    result = {
      type: "coins",
      coins,
      message: `💰 Você encontrou dinheiro boiando na água e ganhou ${formatBRL(coins)}.`,
    };
  } else if (roll < 84) {
    const coins = randomInt(1200, 5000);
    user.coins += coins;
    user.stats.money += coins;
    result = {
      type: "coins",
      coins,
      message: `💰 Você pescou um baú e ganhou ${formatBRL(coins)}.`,
    };
  } else if (roll < 90) {
    user.packs.common += 1;
    result = {
      type: "pack",
      packType: "common",
      message: "📦 Você pescou um Pack Comum.",
    };
  } else if (roll < 95) {
    user.packs.rare += 1;
    result = {
      type: "pack",
      packType: "rare",
      message: "📦 Você pescou um Pack Raro.",
    };
  } else {
    const pokemon = drawPokemon(catalog, ["comum", "incomum", "raro", "epico", "lendario"]);
    if (!pokemon) {
      user.stats.nothing += 1;
      result = {
        type: "nothing",
        message: "🎣 Você pescou... mas não tem pokémons cadastrados em pokemons.json.",
      };
    } else {
      const caught = addPokemonToUser(user, pokemon, "fishing");
      user.stats.packs = user.stats.packs || 0;
      result = {
        type: "pokemon",
        pokemon: caught,
        imagePath: resolvePokemonImagePath(pokemon),
        message: `✨ Você pescou um ${caught.name}!`,
      };
    }
  }

  await saveState(state);
  return result;
}

export async function sellPokemon(jid, query) {
  const state = await loadState();
  const user = getUser(state, jid);
  const collection = Array.isArray(user.pokemons) ? user.pokemons : [];

  if (!collection.length) {
    throw new Error("Você não tem pokémons para vender.");
  }

  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    throw new Error("Digite o nome ou o número do pokémon que quer vender.");
  }

  let index = -1;

  if (/^\d+$/.test(normalizedQuery)) {
    index = Number(normalizedQuery) - 1;
  } else {
    const matches = collection.reduce((found, item, itemIndex) => {
      const name = normalizeText(item.name);
      if (name === normalizedQuery || name.includes(normalizedQuery) || item.uid === query.trim()) {
        found.push(itemIndex);
      }
      return found;
    }, []);

    if (matches.length > 1) {
      throw new Error("Encontrei mais de um Pokémon. Venda pelo número mostrado na coleção.");
    }

    index = matches[0] ?? -1;
  }

  if (index < 0 || index >= collection.length) {
    throw new Error("Pokémon não encontrado na sua coleção.");
  }

  const [pokemon] = collection.splice(index, 1);
  const sellValue = Math.max(1, Math.floor((Number(pokemon.value) || 0) * 0.6));

  user.coins += sellValue;
  user.stats.sold += 1;

  await saveState(state);

  return {
    pokemon,
    sellValue,
    remainingCoins: user.coins,
  };
}

export async function getUserSummary(jid) {
  const state = await loadState();
  const user = getUser(state, jid);
  const catalog = await loadCatalog();
  const bestPokemon = getBestPokemon(user.pokemons);

  return {
    coins: user.coins,
    packs: { ...user.packs },
    pokemons: [...user.pokemons],
    totalPokemons: user.pokemons.length,
    totalValue: user.pokemons.reduce((acc, item) => acc + (Number(item.value) || 0), 0),
    fishingCount: user.fishingCount,
    stats: { ...user.stats },
    catalog,
    bestPokemon,
  };
}

export function formatMoney(value) {
  return formatBRL(value);
}