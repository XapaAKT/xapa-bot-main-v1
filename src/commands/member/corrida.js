import fs from "node:fs";
import path from "node:path";
import { PREFIX, DATABASE_DIR, OWNER_LID } from "../../config.js";
import {
  formatCoins,
  formatDuration,
  getUserEconomy,
  updateUserEconomy,
} from "../../utils/economy.js";
import { getRandomNumber, getUserName, onlyNumbers } from "../../utils/index.js";

const RACES_FILE = path.join(DATABASE_DIR, "snail-races.json");
const LOBBY_WAIT_MS = 2 * 60 * 1000; // 2 minutos
const RACE_STEP_DELAY_MS = 1820; // 30% mais lento que 1400ms
const TRACK_LENGTH = 18;
const SPECIAL_ANIMAL_CHANCE = 0.01; // 1%

const SPECIAL_ANIMALS = [
  { emoji: "🐇", name: "Coelho Turbo", bonus: 3 },
  { emoji: "🐆", name: "Guepardo", bonus: 4 },
  { emoji: "🦊", name: "Raposa Veloz", bonus: 2 },
  { emoji: "🐎", name: "Cavalo Relâmpago", bonus: 3 },
];

const raceTimers = new Map();

function ensureRaceFile() {
  if (!fs.existsSync(DATABASE_DIR)) {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
  }

  if (!fs.existsSync(RACES_FILE)) {
    fs.writeFileSync(RACES_FILE, JSON.stringify({}, null, 2));
  }
}

function readDB() {
  try {
    ensureRaceFile();

    const raw = fs.readFileSync(RACES_FILE, "utf8").trim();
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
}

function saveDB(db) {
  fs.writeFileSync(RACES_FILE, JSON.stringify(db, null, 2));
}

function getRace(groupJid) {
  const db = readDB();
  return db[groupJid] || null;
}

function setRace(groupJid, race) {
  const db = readDB();
  db[groupJid] = race;
  saveDB(db);
}

function deleteRace(groupJid) {
  clearTimer(groupJid);

  const db = readDB();
  delete db[groupJid];
  saveDB(db);
}

function clearTimer(groupJid) {
  const timer = raceTimers.get(groupJid);
  if (timer) {
    clearTimeout(timer);
    raceTimers.delete(groupJid);
  }
}

function normalizeName(name) {
  const value = String(name || "").trim();
  if (!value || value === ".") return "usuário";
  return value;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeTrack(position) {
  const safePos = Math.max(0, Math.min(TRACK_LENGTH, Number(position) || 0));
  return `🏁${"▰".repeat(safePos)}🐌${"▱".repeat(TRACK_LENGTH - safePos)}🎯`;
}

function parseTokens(fullArgs, args) {
  const raw =
    String(fullArgs || "").trim() ||
    (Array.isArray(args) ? args.join(" ").trim() : "");

  return raw.split(/\s+/).filter(Boolean);
}

function pickSpecialAnimal() {
  return SPECIAL_ANIMALS[getRandomNumber(0, SPECIAL_ANIMALS.length - 1)];
}

function renderLobby(race) {
  const remainingMs = Math.max(0, race.expiresAt - Date.now());
  const remainingText = formatDuration(remainingMs);

  const playersText =
    race.players.length > 0
      ? race.players
          .map(
            (p, i) =>
              `┃ ${String(i + 1).padStart(2, "0")}. ${p.name} — caracol ${p.snail}`,
          )
          .join("\n")
      : "┃ Nenhum participante ainda.";

  return `
╭━━━〔 🐌 𝕮𝕺𝕽𝕽𝕴𝔻𝔸 𝔻𝔼 ℂ𝔸ℝ𝔸ℂ𝕆𝕃 〕━━━╮
┃
┃ 🌿 Pista: Jardim Xapa
┃ 💵 Aposta por pessoa: ${formatCoins(race.bet)} XC$
┃ 👥 Jogadores: ${race.players.length}/4
┃ ⏳ Começa em: ${remainingText}
┃
╭──────〔 👥 PARTICIPANTES 〕──────╮
${playersText}
╰────────────────────────────╯
┃
┃ Para entrar:
┃ ${PREFIX}corrida aceitar ${race.bet} <caracol>
┃
┃ Exemplo:
┃ ${PREFIX}corrida aceitar ${race.bet} 2
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim();
}

function renderStatus(race) {
  const remainingMs = Math.max(0, race.expiresAt - Date.now());
  const remainingText = formatDuration(remainingMs);

  const playersText =
    race.players.length > 0
      ? race.players
          .map(
            (p, i) =>
              `┃ ${String(i + 1).padStart(2, "0")}. ${p.name} — caracol ${p.snail}`,
          )
          .join("\n")
      : "┃ Nenhum participante ainda.";

  return `
╭━━━〔 🐌 𝕊𝕋𝔸𝕋𝕌𝕊 𝔻𝔸 ℂ𝕆ℝℝ𝕀𝔻𝔸 〕━━━╮
┃
┃ 📌 Status: ${race.status}
┃ 💵 Aposta por pessoa: ${formatCoins(race.bet)} XC$
┃ 👥 Jogadores: ${race.players.length}/4
┃ ⏳ Tempo restante: ${race.status === "waiting" ? remainingText : "corrida em andamento"}
┃
╭──────〔 👥 PARTICIPANTES 〕──────╮
${playersText}
╰────────────────────────────╯
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim();
}

function renderRaceBoard(race, positions, round, totalRounds) {
  const lanes = race.players
    .map((player, index) => {
      const special =
        race.specialAnimal && Number(race.specialIndex) === Number(index);

      const token = special ? race.specialAnimal.emoji : "🐌";
      const badge = special ? `〔${race.specialAnimal.name}〕` : "";

      return `┃ ${token} ${player.snail} ${badge} | ${makeTrack(positions[index])} | ${player.name}`;
    })
    .join("\n");

  return `
╭━━━〔 🐌 𝕮𝕺𝕽𝕽𝕴𝔻𝔸 𝔼𝕄 𝔸ℕ𝔻𝔸𝕄𝔼ℕ𝕋𝕆 〕━━━╮
┃
┃ 🌿 Pista: Jardim Xapa
┃ 💵 Aposta: ${formatCoins(race.bet)} XC$
┃ 👥 Jogadores: ${race.players.length}/4
┃ 🎲 Rodada: ${round}/${totalRounds}
┃
${lanes}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim();
}

function renderFinalBoard(race, positions, winner, pot) {
  const lanes = race.players
    .map((player, index) => {
      const special =
        race.specialAnimal && Number(race.specialIndex) === Number(index);

      const token = special ? race.specialAnimal.emoji : "🐌";
      const badge = special ? `〔${race.specialAnimal.name}〕` : "";
      const tag =
        String(player.userLid) === String(winner.userLid) ? "🏆 VENCEDOR" : "";

      return `┃ ${token} ${player.snail} ${badge} | ${makeTrack(positions[index])} | ${player.name} ${tag}`.trim();
    })
    .join("\n");

  return `
╭━━━〔 🏆 𝕽𝕰𝕾𝕌𝕃𝕋𝔸𝔻𝕆 𝕱𝕴ℕ𝔸𝕃 〕━━━╮
┃
┃ 🌿 Pista: Jardim Xapa
┃ 💵 Pot total: ${formatCoins(pot)} XC$
┃ 👥 Participantes: ${race.players.length}
┃
┃ 🏆 Vencedor: ${winner.name}
┃ 🎯 Caracol vencedor: ${winner.snail}
┃ ${race.specialAnimal ? `✨ Animal raro: ${race.specialAnimal.name}` : "🐌 Corrida normal"}
┃
${lanes}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim();
}

function renderRareAnimalIntro(race) {
  if (!race.specialAnimal) return "";

  return `
╭━━━〔 🌟 𝔼𝕍𝔼ℕ𝕋𝕆 ℝÁℝ𝕆 〕━━━╮
┃
┃ ✨ Um animal especial apareceu na pista!
┃ ${race.specialAnimal.emoji} ${race.specialAnimal.name}
┃ ⚡ Ele é mais rápido que um caracol comum.
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim();
}

async function refundPlayers(race) {
  for (const player of race.players) {
    updateUserEconomy(player.userLid, player.name, (data) => {
      data.coins += player.bet;
      data.name = player.name;
      return data;
    });
  }
}

async function updateBoardMessage(socket, remoteJid, boardKey, text) {
  try {
    if (boardKey) {
      return await socket.sendMessage(remoteJid, {
        text,
        edit: boardKey,
      });
    }
  } catch (error) {
    console.error("Erro ao editar a corrida:", error);
  }

  return await socket.sendMessage(remoteJid, {
    text,
  });
}

async function startRace({ socket, remoteJid, groupJid }) {
  clearTimer(groupJid);

  const race = getRace(groupJid);
  if (!race) return;
  if (race.status !== "waiting") return;

  if (race.players.length < 2) {
    await refundPlayers(race);
    deleteRace(groupJid);

    await socket.sendMessage(remoteJid, {
      text: `
╭━━━〔 🛑 𝕮𝕺𝕽ℝ𝕴𝔻𝔸 ℂ𝔸ℕℂ𝔼𝕃𝔸𝔻𝔸 〕━━━╮
┃
┃ A corrida foi cancelada porque não houve
┃ no mínimo 2 jogadores.
┃
┃ As apostas foram devolvidas.
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim(),
    });

    return;
  }

  race.status = "running";
  race.startedAt = Date.now();
  race.updatedAt = Date.now();

  const hasRareAnimal = Math.random() < SPECIAL_ANIMAL_CHANCE;
  if (hasRareAnimal) {
    race.specialIndex = getRandomNumber(0, race.players.length - 1);
    race.specialAnimal = pickSpecialAnimal();
  } else {
    race.specialIndex = -1;
    race.specialAnimal = null;
  }

  setRace(groupJid, race);

  if (race.specialAnimal) {
    await socket.sendMessage(remoteJid, {
      text: renderRareAnimalIntro(race),
    });
    await delay(1200);
  }

  let positions = race.players.map(() => 0);
  const totalRounds = 12;

  const boardMessage = await socket.sendMessage(remoteJid, {
    text: renderRaceBoard(race, positions, 0, totalRounds),
  });

  let boardKey = boardMessage?.key || null;
  race.boardMessageKey = boardKey;
  race.updatedAt = Date.now();
  setRace(groupJid, race);

  let winnerIndex = -1;

  for (let round = 1; round <= totalRounds; round++) {
    const currentRace = getRace(groupJid);
    if (!currentRace || currentRace.status !== "running" || currentRace.cancelled) {
      return;
    }

    positions = positions.map((pos, index) => {
      const special =
        race.specialAnimal && Number(race.specialIndex) === Number(index);

      const baseMove = getRandomNumber(1, 4);
      const specialBonus = special ? race.specialAnimal.bonus : 0;

      return Math.min(TRACK_LENGTH, pos + baseMove + specialBonus);
    });

    winnerIndex = positions.findIndex((pos) => pos >= TRACK_LENGTH);

    const edited = await updateBoardMessage(
      socket,
      remoteJid,
      boardKey,
      renderRaceBoard(race, positions, round, totalRounds),
    );

    if (edited?.key) {
      boardKey = edited.key;
      race.boardMessageKey = boardKey;
      setRace(groupJid, race);
    }

    if (winnerIndex !== -1) {
      break;
    }

    await delay(RACE_STEP_DELAY_MS);
  }

  const currentRace = getRace(groupJid);
  if (!currentRace || currentRace.cancelled) {
    return;
  }

  if (winnerIndex === -1) {
    const best = Math.max(...positions);
    winnerIndex = positions.indexOf(best);
  }

  const winner = race.players[winnerIndex];
  const pot = race.bet * race.players.length;
  const xpReward = getRandomNumber(20, 40) + (race.specialAnimal ? 8 : 0);

  updateUserEconomy(winner.userLid, winner.name, (data) => {
    data.coins += pot;
    data.xp = Number(data.xp || 0) + xpReward;
    data.name = winner.name;
    return data;
  });

  await updateBoardMessage(
    socket,
    remoteJid,
    boardKey,
    renderFinalBoard(race, positions, winner, pot),
  );

  deleteRace(groupJid);

  await socket.sendMessage(remoteJid, {
    text: `
╭━━━〔 🎉 𝕮𝕺𝕽ℝ𝕴𝔻𝔸 𝔼ℕℂ𝔼ℝℝ𝔸𝔻𝔸 〕━━━╮
┃
┃ 🏆 Vencedor: ${winner.name}
┃ 🐌 Caracol: ${winner.snail}
┃ 💵 Prêmio: ${formatCoins(pot)} XC$
┃ ⭐ XP ganho: ${xpReward}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim(),
  });
}

export default {
  name: "corrida",
  description: "Corrida de caracóis com apostas",
  commands: ["corrida", "caracol"],
  usage: `${PREFIX}corrida iniciar <valor>`,

  handle: async ({
    args,
    fullArgs,
    sendReply,
    sendSuccessReact,
    userLid,
    webMessage,
    socket,
    remoteJid,
  }) => {
    try {
      const isGroup = String(remoteJid || "").endsWith("@g.us");
      if (!isGroup) {
        return sendReply("Esse comando só funciona em grupos.");
      }

      const userName = normalizeName(getUserName(webMessage, userLid, "usuário"));
      const groupJid = remoteJid;

      const tokens = parseTokens(fullArgs, args);
      const sub = String(tokens[0] || "").toLowerCase();

      if (!sub) {
        await sendReply(`
╭━━━〔 🐌 𝕮𝕺ℝℝ𝕴𝔻𝔸 𝔻𝔼 ℂ𝔸ℝ𝔸ℂ𝕆𝕃 〕━━━╮
┃
┃ Comandos:
┃ ${PREFIX}corrida iniciar <valor>
┃ ${PREFIX}corrida aceitar <valor> <caracol>
┃ ${PREFIX}corrida cancelar
┃ ${PREFIX}corrida status
┃
┃ Regras:
┃ • mínimo 2 jogadores
┃ • máximo 4 jogadores
┃ • aposta fixa definida no início
┃ • cada jogador escolhe um caracol de 1 a 4
┃ • 1% de chance de surgir um animal raro
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim());
        return;
      }

      if (sub === "iniciar" || sub === "abrir" || sub === "criar") {
        const bet = Number(onlyNumbers(tokens[1] || ""));

        if (!bet || bet <= 0) {
          return sendReply(`
╭━━━〔 ⚠️ 𝕍𝔸𝕃𝕆ℝ 𝕀ℕ𝕍Á𝕃𝕀𝔻𝕆 〕━━━╮
┃
┃ Uso:
┃ ${PREFIX}corrida iniciar <valor>
┃
┃ Exemplo:
┃ ${PREFIX}corrida iniciar 100
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim());
        }

        const existing = getRace(groupJid);
        if (existing && (existing.status === "waiting" || existing.status === "running")) {
          return sendReply(`
╭━━━〔 ⚠️ 𝕮𝕺ℝℝ𝕴𝔻𝔸 𝕵Á 𝔸𝔹𝔼ℝ𝕋𝔸 〕━━━╮
┃
┃ Já existe uma corrida em andamento neste grupo.
┃
┃ Use:
┃ ${PREFIX}corrida cancelar
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim());
        }

        const race = {
          groupJid,
          status: "waiting",
          bet,
          creator: {
            userLid,
            name: userName,
          },
          players: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          expiresAt: Date.now() + LOBBY_WAIT_MS,
          boardMessageKey: null,
          cancelled: false,
          specialIndex: -1,
          specialAnimal: null,
        };

        setRace(groupJid, race);

        clearTimer(groupJid);
        const timer = setTimeout(() => {
          startRace({ socket, remoteJid, groupJid }).catch((error) => {
            console.error("Erro ao iniciar corrida:", error);
          });
        }, LOBBY_WAIT_MS);

        raceTimers.set(groupJid, timer);

        await sendSuccessReact();
        await sendReply(renderLobby(race));
        return;
      }

      if (sub === "status" || sub === "info") {
        const race = getRace(groupJid);

        if (!race) {
          return sendReply(`
╭━━━〔 🐌 𝕊𝕋𝔸𝕋𝕌𝕊 𝔻𝔸 ℂ𝕆ℝℝ𝕀𝔻𝔸 〕━━━╮
┃
┃ Não existe corrida aberta neste grupo.
┃
┃ Use:
┃ ${PREFIX}corrida iniciar <valor>
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim());
        }

        await sendSuccessReact();
        await sendReply(renderStatus(race));
        return;
      }

      if (sub === "aceitar" || sub === "entrar" || sub === "join") {
        const race = getRace(groupJid);

        if (!race || race.status !== "waiting") {
          return sendReply(`
╭━━━〔 ⚠️ 𝕊𝔼𝕄 ℂ𝕆ℝℝ𝕀𝔻𝔸 𝔸𝔹𝔼ℝ𝕋𝔸 〕━━━╮
┃
┃ Não existe corrida aberta neste grupo.
┃
┃ Use:
┃ ${PREFIX}corrida iniciar <valor>
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim());
        }

        let bet = race.bet;
        let snail = null;

        if (tokens.length >= 3) {
          bet = Number(onlyNumbers(tokens[1] || ""));
          snail = Number(onlyNumbers(tokens[2] || ""));
        } else if (tokens.length === 2) {
          snail = Number(onlyNumbers(tokens[1] || ""));
        }

        if (!snail || snail < 1 || snail > 4) {
          return sendReply(`
╭━━━〔 ⚠️ 𝕮𝔸ℝ𝔸ℂ𝕆𝕃 𝕀ℕ𝕍Á𝕃𝕀𝔻𝕆 〕━━━╮
┃
┃ Escolha um caracol de 1 a 4.
┃
┃ Exemplo:
┃ ${PREFIX}corrida aceitar ${race.bet} 2
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim());
        }

        if (bet !== race.bet) {
          return sendReply(`
╭━━━〔 ⚠️ 𝕍𝔸𝕃𝕆ℝ 𝕀ℕℂ𝕆ℝℝ𝔼𝕋𝕆 〕━━━╮
┃
┃ A aposta dessa corrida é ${formatCoins(race.bet)} XC$.
┃
┃ Exemplo:
┃ ${PREFIX}corrida aceitar ${race.bet} ${snail}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim());
        }

        if (race.players.some((p) => String(p.userLid) === String(userLid))) {
          return sendReply("Você já entrou nessa corrida.");
        }

        if (race.players.some((p) => Number(p.snail) === snail)) {
          return sendReply(`O caracol ${snail} já foi escolhido por outra pessoa.`);
        }

        if (race.players.length >= 4) {
          return sendReply("A corrida já está cheia.");
        }

        const eco = getUserEconomy(userLid, userName);

        if (eco.coins < race.bet) {
          return sendReply(`
╭━━━〔 💸 𝕊𝔸𝕃𝔻𝕆 𝕀ℕ𝕊𝕌𝔽𝕀ℂ𝕀𝔼ℕ𝕋𝔼 〕━━━╮
┃
┃ Você precisa de ${formatCoins(race.bet)} XC$ para entrar.
┃
┃ Seu saldo: ${formatCoins(eco.coins)} XC$
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim());
        }

        updateUserEconomy(userLid, userName, (data) => {
          data.coins -= race.bet;
          data.name = userName;
          return data;
        });

        race.players.push({
          userLid,
          name: userName,
          snail,
          bet: race.bet,
          joinedAt: Date.now(),
        });

        race.updatedAt = Date.now();
        setRace(groupJid, race);

        await sendSuccessReact();
        await sendReply(`
╭━━━〔 ✅ 𝔼ℕ𝕋ℝ𝔸𝔻𝔸 ℂ𝕆ℕ𝔽𝕀ℝ𝕄𝔸𝔻𝔸 〕━━━╮
┃
┃ 👤 ${userName}
┃ 🐌 Caracol: ${snail}
┃ 💵 Aposta: ${formatCoins(race.bet)} XC$
┃
┃ Jogadores na corrida: ${race.players.length}/4
┃
┃ ${race.players.length >= 2 ? "A corrida já pode começar quando o tempo acabar." : "Aguardando mais participantes..."}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim());

        if (race.players.length >= 4) {
          startRace({ socket, remoteJid, groupJid }).catch((error) => {
            console.error("Erro ao iniciar corrida cheia:", error);
          });
        }

        return;
      }

      if (sub === "cancelar" || sub === "parar" || sub === "stop") {
        const race = getRace(groupJid);

        if (!race || race.status === "finished") {
          return sendReply("Não existe corrida aberta para cancelar.");
        }

        const isOwner = String(userLid) === String(OWNER_LID);
        const isCreator = String(race.creator?.userLid) === String(userLid);

        if (!isOwner && !isCreator) {
          return sendReply("Só quem iniciou a corrida ou o dono do bot pode cancelar.");
        }

        race.cancelled = true;
        race.status = "cancelled";
        race.updatedAt = Date.now();
        setRace(groupJid, race);

        await refundPlayers(race);
        deleteRace(groupJid);

        await sendSuccessReact();
        await sendReply(`
╭━━━〔 🛑 𝕮𝕺ℝℝ𝕴𝔻𝔸 ℂ𝔸ℕℂ𝔼𝕃𝔸𝔻𝔸 〕━━━╮
┃
┃ A corrida foi cancelada com sucesso.
┃ Todas as apostas foram devolvidas.
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim());
        return;
      }

      await sendReply(`
╭━━━〔 🐌 𝕮𝕺ℝℝ𝕴𝔻𝔸 𝔻𝔼 ℂ𝔸ℝ𝔸ℂ𝕆𝕃 〕━━━╮
┃
┃ Comando inválido.
┃
┃ Use:
┃ ${PREFIX}corrida iniciar <valor>
┃ ${PREFIX}corrida aceitar <valor> <caracol>
┃ ${PREFIX}corrida cancelar
┃ ${PREFIX}corrida status
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim());
    } catch (err) {
      console.error(err);
      await sendReply("⛓️❌ Erro ao executar a corrida.");
    }
  },
};