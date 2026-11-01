import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { PREFIX } from "../config.js";
import { getUserEconomy, updateUserEconomy, formatCoins } from "../utils/economy.js";

const STATE_FILE = path.resolve(process.cwd(), "database", "rpgState.json");
const CLASSES = {
  guerreiro: { name: "Guerreiro", emoji: "⚔️", hp: 130, attack: 18, defense: 12 },
  mago: { name: "Mago", emoji: "🔮", hp: 90, attack: 25, defense: 7 },
  cacador: { name: "Caçador", emoji: "🏹", hp: 105, attack: 21, defense: 9 },
  paladino: { name: "Paladino", emoji: "🛡️", hp: 155, attack: 15, defense: 18 },
  ladino: { name: "Ladino", emoji: "🗡️", hp: 100, attack: 28, defense: 8 },
  druida: { name: "Druida", emoji: "🌿", hp: 115, attack: 20, defense: 11 },
};
const PROFESSIONS = {
  ferreiro: { name: "Ferreiro", emoji: "🔨", bonus: "Equipamentos custam menos." },
  alquimista: { name: "Alquimista", emoji: "⚗️", bonus: "Poções são mais eficientes." },
  coletor: { name: "Coletor", emoji: "🌿", bonus: "Encontra mais itens ao explorar." },
  mercador: { name: "Mercador", emoji: "💼", bonus: "Recebe mais moedas em recompensas." },
};
const MONSTERS = {
  slime: { name: "Slime Verde", hp: 55, attack: 9, defense: 2, reward: 700, xp: 35, drop: "poção" },
  goblin: { name: "Goblin Saqueador", hp: 95, attack: 15, defense: 6, reward: 1400, xp: 65, drop: "ferro" },
  lobo: { name: "Lobo Sombrio", hp: 125, attack: 19, defense: 8, reward: 2200, xp: 95, drop: "pele" },
  dragao: { name: "Dragão Ancião", hp: 300, attack: 32, defense: 16, reward: 9000, xp: 260, drop: "escama" },
};
const SHOP = {
  pocao: { category: "pocoes", name: "Poção de cura", price: 600, description: "recupera energia" },
  pocaoForca: { id: "pocao-forca", category: "pocoes", name: "Poção de força", price: 2200, attack: 5, description: "+5 ataque na batalha" },
  pocaoDefesa: { id: "pocao-defesa", category: "pocoes", name: "Poção de defesa", price: 2200, defense: 5, description: "+5 defesa na batalha" },
  espada: { category: "armas", name: "Espada de aço", price: 9000, attack: 8, description: "+8 ataque" },
  adaga: { category: "armas", name: "Adaga sombria", price: 12000, attack: 12, description: "+12 ataque" },
  cajado: { category: "armas", name: "Cajado arcano", price: 11000, attack: 11, description: "+11 ataque" },
  armadura: { category: "armaduras", name: "Armadura reforçada", price: 9000, defense: 8, description: "+8 defesa" },
  escudo: { category: "armaduras", name: "Escudo ancestral", price: 13000, defense: 13, description: "+13 defesa" },
};
const SHOP_CATEGORIES = {
  pocoes: { name: "Poções", emoji: "⚗️" },
  armas: { name: "Armas", emoji: "⚔️" },
  armaduras: { name: "Armaduras", emoji: "🛡️" },
};
const emptyState = { users: {} };
const keyOf = (jid) => String(jid || "unknown").replace(/\D/g, "") || "unknown";
const levelFor = (xp) => Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1);
const money = (value) => `${formatCoins(value)} XC$`;
const pick = (items) => items[Math.floor(Math.random() * items.length)];
const roll = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function loadState() {
  try {
    const raw = await fs.readFile(STATE_FILE, "utf8");
    const state = JSON.parse(raw);
    if (!state || typeof state !== "object" || Array.isArray(state)) throw new Error("Estado RPG inválido.");
    state.users ||= {};
    return state;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
    await fs.writeFile(STATE_FILE, JSON.stringify(emptyState, null, 2), "utf8");
    return structuredClone(emptyState);
  }
}

async function saveState(state) {
  await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

function getUser(state, jid, name) {
  const key = keyOf(jid);
  state.users[key] ||= {
    name: name || "aventureiro", class: null, profession: null, xp: 0, inventory: {},
    equipment: [], battles: 0, victories: 0, battle: null,
  };
  const user = state.users[key];
  if (name && !/^\d+$/.test(String(name))) user.name = name;
  user.inventory ||= {};
  user.equipment ||= [];
  return user;
}

function stats(user) {
  const base = CLASSES[user.class] || { hp: 80, attack: 10, defense: 5 };
  return {
    hp: base.hp + (user.equipment.includes("armadura") ? 16 : 0),
    attack: base.attack + user.equipment.reduce((sum, item) => sum + (SHOP[item]?.attack || 0), 0),
    defense: base.defense + user.equipment.reduce((sum, item) => sum + (SHOP[item]?.defense || 0), 0),
  };
}

function addItem(user, item, amount = 1) {
  user.inventory[item] = (user.inventory[item] || 0) + amount;
}

export async function chooseClass(jid, classInput, name) {
  const classKey = String(classInput || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!CLASSES[classKey]) throw new Error("Classe inválida. Escolha: guerreiro, mago, cacador, paladino, ladino ou druida.");
  const state = await loadState();
  const user = getUser(state, jid, name);
  if (user.class) throw new Error("Você já escolheu sua classe. A escolha é permanente.");
  user.class = classKey;
  await saveState(state);
  return CLASSES[classKey];
}

export async function chooseProfession(jid, professionInput, name) {
  const profession = String(professionInput || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!PROFESSIONS[profession]) throw new Error("Profissão inválida. Escolha: ferreiro, alquimista, coletor ou mercador.");
  const state = await loadState();
  const user = getUser(state, jid, name);
  if (!user.class) throw new Error("Escolha uma classe antes de escolher uma profissão.");
  if (user.profession) throw new Error("Você já escolheu sua profissão. A escolha é permanente.");
  user.profession = profession;
  await saveState(state);
  return PROFESSIONS[profession];
}

export async function getProfile(jid, name) {
  const state = await loadState();
  const user = getUser(state, jid, name);
  const economy = getUserEconomy(jid, name);
  return { user, economy, classData: CLASSES[user.class], stats: stats(user), level: levelFor(user.xp) };
}

export function buildProfileText({ user, classData, stats: values, economy, level }) {
  return `╔══════════════════════════════╗
║ 𖤐 𝐂𝐑𝐎̂𝐍𝐈𝐂𝐀𝐒 𝐃𝐎 𝐑𝐄𝐈𝐍𝐎 𖤐 ║
╠══════════════════════════════╣
║ 👤 ${user.name}
║ ${classData?.emoji || "🧭"} Classe: ${classData?.name || "não escolhida"}
║ 💼 Profissão: ${user.profession ? PROFESSIONS[user.profession]?.name : "não escolhida"}
║ ✦ Nível: ${level}  | XP: ${user.xp}
║ ♥ HP: ${values.hp}  ⚔ ATK: ${values.attack}  🛡 DEF: ${values.defense}
║ ◈ Ouro: ${money(economy.coins)}
║ ✧ Vitórias: ${user.victories}  | Batalhas: ${user.battles}
╚══════════════════════════════╝
${user.class ? `✦ ${PREFIX}rpgexplorar ou ${PREFIX}rpgbatalha para iniciar uma missão.` : "✦ Escolha uma classe para iniciar sua jornada."}
${user.class && !user.profession ? "✦ Escolha também uma profissão para desbloquear bônus." : ""}`;
}

export function buildShopText(categoryInput = "") {
  const category = String(categoryInput || "").toLowerCase();
  if (!category || !SHOP_CATEGORIES[category]) {
    return `╔═══〔 🏰 MERCADO DO REINO 〕═══╗
║ Escolha uma ala da loja:
║ ⚗️ ${categoryCommand("pocoes")} — poções e elixires
║ ⚔️ ${categoryCommand("armas")} — armas de batalha
║ 🛡️ ${categoryCommand("armaduras")} — proteção e escudos
╚══════════════════════════════╝`;
  }
  const items = Object.entries(SHOP).filter(([, item]) => item.category === category);
  return `╔══〔 ${SHOP_CATEGORIES[category].emoji} ${SHOP_CATEGORIES[category].name.toUpperCase()} 〕══╗
${items.map(([id, item]) => `║ ✦ ${item.name} — ${money(item.price)}
║   ${item.description} | compre: /rpgcomprar ${item.id || id}`).join("\n")}
╚══════════════════════════════╝`;
}

function categoryCommand(category) {
  return `/rpgloja ${category}`;
}

export async function explore(jid, name) {
  const state = await loadState();
  const user = getUser(state, jid, name);
  if (!user.class) throw new Error("Escolha uma classe primeiro com /rpgclasse.");
  const event = pick(["coins", "item", "monster", "nothing"]);
  if (event === "coins") {
    const coins = roll(300, 1800);
    updateUserEconomy(jid, name, (entry) => ({ ...entry, coins: entry.coins + coins }));
    await saveState(state);
    return `🗺️ Você encontrou um baú e ganhou ${money(coins)}!`;
  }
  if (event === "item") {
    const item = pick(["poção", "ferro", "pele"]);
    addItem(user, item);
    await saveState(state);
    return `🌿 Você coletou **${item}** e guardou no inventário.`;
  }
  if (event === "monster") {
    const monsterId = pick(["slime", "goblin", "lobo"]);
    user.battle = { monsterId, hp: MONSTERS[monsterId].hp };
    await saveState(state);
    return `👹 Um **${MONSTERS[monsterId].name}** apareceu! Use ${PREFIX}ataca ou ${PREFIX}fugir.`;
  }
  await saveState(state);
  return "🌙 Você explorou a região, mas encontrou apenas pegadas antigas. Tente novamente.";
}

export async function startBattle(jid, monsterInput, name) {
  const state = await loadState();
  const user = getUser(state, jid, name);
  if (!user.class) throw new Error("Escolha uma classe primeiro com /rpgclasse.");
  if (user.battle) throw new Error(`Você já está em batalha. Use ${PREFIX}ataca ou ${PREFIX}fugir.`);
  const id = String(monsterInput || "slime").toLowerCase();
  const monster = MONSTERS[id];
  if (!monster) throw new Error(`Monstro inválido. Escolha: ${Object.keys(MONSTERS).join(", ")}.`);
  user.battle = { monsterId: id, hp: monster.hp };
  await saveState(state);
  return {
    text: `⚔️ Você desafiou **${monster.name}** (${monster.hp} HP)! Use ${PREFIX}ataca.`,
    monster,
  };
}

export async function attack(jid, name) {
  const state = await loadState();
  const user = getUser(state, jid, name);
  if (!user.battle) throw new Error(`Você não está em batalha. Use ${PREFIX}explorar ou ${PREFIX}batalha.`);
  const monster = MONSTERS[user.battle.monsterId];
  const values = stats(user);
  const critical = Math.random() < 0.18;
  const playerDamage = Math.max(1, (values.attack + roll(-4, 6) - monster.defense) * (critical ? 2 : 1));
  user.battle.hp -= playerDamage;
  let text = `⚔️ Você causou ${playerDamage} de dano em ${monster.name}.`;
  const result = { text, critical, victory: false, levelUp: false, loot: null, monster, battleEnded: false };
  if (user.battle.hp <= 0) {
    const previousLevel = levelFor(user.xp);
    user.battle = null;
    user.victories += 1;
    user.xp += monster.xp;
    addItem(user, monster.drop);
    updateUserEconomy(jid, name, (entry) => ({ ...entry, coins: entry.coins + monster.reward }));
    text += `\n🏆 Vitória! +${monster.xp} XP, ${money(monster.reward)} e 1x ${monster.drop}.`;
    result.victory = true;
    result.battleEnded = true;
    result.loot = monster.drop;
    result.levelUp = levelFor(user.xp) > previousLevel;
  } else {
    const damage = Math.max(1, monster.attack + roll(-3, 4) - values.defense);
    text += `\n👹 O monstro revidou com ${damage} de dano.`;
    text += `\n❤️ Inimigo: ${Math.max(0, user.battle.hp)}/${monster.hp} HP\n💡 Use /rpgatacar novamente ou /rpgfugir.`;
  }
  user.battles += 1;
  await saveState(state);
  result.text = text;
  result.enemyHp = user.battle?.hp || 0;
  result.level = levelFor(user.xp);
  return result;
}

export async function flee(jid, name) {
  const state = await loadState();
  const user = getUser(state, jid, name);
  if (!user.battle) throw new Error("Você não está em batalha.");
  user.battle = null;
  await saveState(state);
  return "🏃 Você fugiu da batalha. Melhor voltar mais preparado.";
}

export async function buyItem(jid, itemInput, name) {
  const normalized = String(itemInput || "").toLowerCase();
  const itemEntry = Object.entries(SHOP).find(([id, item]) => id.toLowerCase() === normalized || item.id === normalized);
  const item = itemEntry?.[1];
  const itemId = itemEntry?.[0];
  if (!item) throw new Error(`Item inválido. Use ${PREFIX}loja para ver as sublojas.`);
  const state = await loadState();
  const user = getUser(state, jid, name);
  if (item.category !== "pocoes" && user.equipment.includes(itemId)) throw new Error("Você já equipa esse item.");
  const result = updateUserEconomy(jid, name, (entry) => {
    if (entry.coins < item.price) throw new Error(`Você precisa de ${money(item.price)}.`);
    return { ...entry, coins: entry.coins - item.price };
  });
  item.category === "pocoes" ? addItem(user, itemId) : user.equipment.push(itemId);
  await saveState(state);
  return `✅ ${item.name} adquirido! Saldo: ${money(result.coins)}.`;
}

export async function getInventory(jid, name) {
  const state = await loadState();
  const user = getUser(state, jid, name);
  return `╔═══〔 🎒 MOCHILA DO AVENTUREIRO 〕═══╗\n${Object.entries(user.inventory).map(([item, amount], index) => `║ [${String(index + 1).padStart(2, "0")}] ✦ ${item} ×${amount}`).join("\n") || "║ [--] mochila vazia"}\n║\n║ 🛡 Equipados: ${user.equipment.join(", ") || "nenhum"}\n╚══════════════════════════════════╝`;
}

function escapeXml(value) {
  return String(value || "").replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char]));
}

function svgToBuffer(svg, width, height) {
  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function renderInventoryCanvas(jid, name) {
  const state = await loadState();
  const user = getUser(state, jid, name);
  const slots = Array.from({ length: 24 }, (_, index) => {
    const item = Object.entries(user.inventory)[index];
    const x = 56 + (index % 6) * 112;
    const y = 206 + Math.floor(index / 6) * 104;
    return `<rect x="${x}" y="${y}" width="88" height="80" rx="8" fill="#17131a" stroke="#9e7b42" stroke-width="3"/>
      <text x="${x + 44}" y="${y + 35}" text-anchor="middle" font-size="26" fill="#d9b86c">${item ? "✦" : "·"}</text>
      <text x="${x + 44}" y="${y + 59}" text-anchor="middle" font-size="12" fill="#eadfbd">${item ? escapeXml(item[0].slice(0, 10)) : "vazio"}</text>
      ${item ? `<text x="${x + 76}" y="${y + 73}" text-anchor="end" font-size="12" fill="#fff">${item[1]}x</text>` : ""}`;
  }).join("");
  const svg = `<svg width="840" height="700" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bag" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#4a3041"/><stop offset="1" stop-color="#1b1721"/></linearGradient><pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="#b48b4e" stroke-opacity=".08"/></pattern></defs>
    <rect width="840" height="700" fill="#211a21"/><rect x="22" y="22" width="796" height="656" rx="18" fill="url(#bag)" stroke="#b48b4e" stroke-width="5"/><rect x="32" y="32" width="776" height="636" rx="12" fill="url(#grid)"/>
    <text x="420" y="78" text-anchor="middle" font-size="31" font-family="serif" font-weight="bold" fill="#e7c77b">𖤐 MOCHILA DO AVENTUREIRO 𖤐</text>
    <text x="420" y="116" text-anchor="middle" font-size="16" fill="#bba982">“Toda jornada começa com o que carregamos.”</text>
    ${slots}<text x="52" y="660" font-size="15" fill="#bba982">Equipamentos: ${escapeXml(user.equipment.join(", ") || "nenhum")}</text>
  </svg>`;
  return svgToBuffer(svg, 840, 700);
}

export async function getBattleView(jid, name) {
  const state = await loadState();
  const user = getUser(state, jid, name);
  const monster = user.battle ? MONSTERS[user.battle.monsterId] : null;
  return { user, monster, monsterHp: user.battle?.hp || 0, playerStats: stats(user) };
}

export async function renderBattleCanvas(jid, name, avatarBuffer = null) {
  const view = await getBattleView(jid, name);
  const monster = view.monster || { name: "Aguardando inimigo", hp: 1, attack: 0 };
  const avatar = avatarBuffer ? `data:image/jpeg;base64,${avatarBuffer.toString("base64")}` : "";
  const playerSprite = avatar ? `<image href="${avatar}" x="105" y="280" width="130" height="130" preserveAspectRatio="xMidYMid slice"/>` : `<text x="170" y="365" text-anchor="middle" font-size="80">🧙</text>`;
  const svg = `<svg width="900" height="520" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#243d5c"/><stop offset="1" stop-color="#789f70"/></linearGradient><pattern id="grass" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M2 16L7 9M12 17L16 11" stroke="#9fc379" stroke-opacity=".35" stroke-width="2"/></pattern></defs>
    <rect width="900" height="520" fill="#172334"/><rect x="25" y="25" width="850" height="470" rx="12" fill="url(#sky)" stroke="#d4b36b" stroke-width="6"/>
    <rect x="30" y="180" width="840" height="305" fill="url(#grass)" opacity=".55"/>
    <path d="M30 360 Q210 285 390 360 T870 350 V490 H30Z" fill="#3c6b3b"/><path d="M30 170 Q220 110 430 170 T870 155" fill="none" stroke="#9ac278" stroke-width="34" opacity=".5"/>
    <text x="55" y="75" font-size="25" font-family="serif" font-weight="bold" fill="#fff">⚔ DUELO DO REINO</text>
    <rect x="54" y="100" width="295" height="65" rx="8" fill="#171b25" stroke="#d4b36b" stroke-width="3"/><text x="72" y="130" font-size="20" fill="#f3e5b3">${escapeXml(view.user.name)}</text><text x="72" y="153" font-size="15" fill="#e98c75">♥ HP ${view.playerStats.hp}</text>
    <rect x="550" y="100" width="295" height="65" rx="8" fill="#171b25" stroke="#d4b36b" stroke-width="3"/><text x="570" y="130" font-size="20" fill="#f3e5b3">${escapeXml(monster.name)}</text><text x="570" y="153" font-size="15" fill="#e98c75">♥ HP ${view.monsterHp}/${monster.hp}</text>
    ${playerSprite}<text x="718" y="370" text-anchor="middle" font-size="90">${view.monster ? "👹" : "❔"}</text>
    <text x="450" y="455" text-anchor="middle" font-size="18" font-family="serif" fill="#f5e9c7">${view.monster ? "Escolha sua ação, aventureiro..." : "Nenhuma batalha em andamento."}</text>
  </svg>`;
  return svgToBuffer(svg, 900, 520);
}

export async function getAvatarBuffer(socket, jid) {
  if (!socket?.profilePictureUrl) return null;
  try {
    const url = await socket.profilePictureUrl(jid, "image");
    const response = await fetch(url);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}
