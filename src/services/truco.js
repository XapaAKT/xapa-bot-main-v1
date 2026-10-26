import { randomBytes, randomInt } from "node:crypto";

const SUITS = [
  { id: "paus", name: "paus", symbol: "♣" },
  { id: "ouros", name: "ouros", symbol: "♦" },
  { id: "copas", name: "copas", symbol: "♥" },
  { id: "espadas", name: "espadas", symbol: "♠" },
];
const RANKS = [
  { value: 1, name: "Ás" },
  { value: 2, name: "2" },
  { value: 3, name: "3" },
  { value: 4, name: "4" },
  { value: 5, name: "5" },
  { value: 6, name: "6" },
  { value: 7, name: "7" },
  { value: 10, name: "Dama" },
  { value: 11, name: "Valete" },
  { value: 12, name: "Rei" },
];
const FIXED_MANILHAS = new Map([
  ["4-paus", 17],
  ["7-copas", 16],
  ["1-espadas", 15],
  ["7-ouros", 14],
]);
const ORDINARY_STRENGTH = new Map([
  [4, 4],
  [5, 5],
  [6, 6],
  [7, 7],
  [10, 8],
  [11, 9],
  [12, 10],
  [1, 11],
  [2, 12],
  [3, 13],
]);
const TRUCO_STAKES = new Map([
  [2, 4],
  [4, 6],
  [6, 9],
  [9, 12],
]);
const activeTables = new Map();

function normalizeJid(jid) {
  return typeof jid === "string"
    ? jid.replace(/:\d+(?=@)/g, "").trim()
    : "";
}

function normalizeCardName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const otherIndex = randomInt(index + 1);
    [items[index], items[otherIndex]] = [items[otherIndex], items[index]];
  }
  return items;
}

export function createTrucoDeck() {
  return SUITS.flatMap((suit) =>
    RANKS.map((rank) => {
      const fixedStrength = FIXED_MANILHAS.get(`${rank.value}-${suit.id}`);
      const value = fixedStrength || ORDINARY_STRENGTH.get(rank.value);

      return {
        id: `${rank.value}-${suit.id}`,
        name: `${rank.name} de ${suit.name}`,
        shortName: `${rank.name} ${suit.symbol}`,
        strength: value,
        isManilha: fixedStrength !== undefined,
      };
    }),
  );
}

function dealHand(table, starterIndex) {
  const deck = shuffle(createTrucoDeck());
  table.players.forEach((player, playerIndex) => {
    player.hand = deck
      .slice(playerIndex * 3, playerIndex * 3 + 3)
      .map((card) => ({
        ...card,
        code: randomBytes(3).toString("hex"),
      }));
    player.tricks = 0;
  });
  table.turnIndex = starterIndex;
  table.starterIndex = starterIndex;
  table.cardsOnTable = [];
  table.trickWinners = [];
  table.stake = 2;
  table.pendingTruco = null;
  table.stage = "playing";
}

function resolveHand(table) {
  const [first, second, third] = table.trickWinners;
  if (table.players[0].tricks >= 2) return 0;
  if (table.players[1].tricks >= 2) return 1;
  if (first !== null && first !== undefined) return first;
  if (second !== null && second !== undefined) return second;
  if (third !== null && third !== undefined) return third;
  return table.starterIndex;
}

function awardHand(table, winnerIndex, stake = table.stake) {
  table.score[winnerIndex] += stake;
  table.pendingTruco = null;

  if (table.score[winnerIndex] >= 12) {
    table.stage = "finished";
    return { matchWinner: winnerIndex };
  }

  dealHand(table, winnerIndex);
  return { nextHand: true };
}

function getNextStake(stake) {
  return TRUCO_STAKES.get(stake) || null;
}

export function createTrucoTable(groupId, host) {
  if (activeTables.has(groupId)) {
    throw new Error("Já existe uma mesa de truco aberta neste grupo.");
  }

  const hostAliases = [...new Set((host.aliases || []).map(normalizeJid).filter(Boolean))];
  if (!hostAliases.length) {
    throw new Error("Não consegui identificar quem abriu a mesa.");
  }

  const table = {
    id: randomBytes(4).toString("hex"),
    groupId,
    stage: "selecting-mode",
    players: [
      {
        aliases: hostAliases,
        jid: normalizeJid(host.privateJid) || hostAliases[0],
        name: host.name || "Jogador 1",
        hand: [],
        tricks: 0,
      },
    ],
    score: [0, 0],
    turnIndex: 0,
    starterIndex: 0,
    cardsOnTable: [],
    trickWinners: [],
    stake: 2,
    pendingTruco: null,
  };

  activeTables.set(groupId, table);
  return table;
}

export function getTrucoTable(groupId, tableId) {
  const table = activeTables.get(groupId);
  return table && (!tableId || table.id === tableId) ? table : null;
}

export function getTrucoTableById(tableId) {
  for (const table of activeTables.values()) {
    if (table.id === tableId) return table;
  }
  return null;
}

export function removeTrucoTable(table) {
  if (activeTables.get(table.groupId) === table) {
    activeTables.delete(table.groupId);
  }
}

export function chooseTrucoMode(table, mode) {
  if (table.stage !== "selecting-mode") {
    throw new Error("A escolha do modo já foi encerrada.");
  }
  if (mode !== "1x1") {
    return false;
  }

  table.stage = "waiting";
  return true;
}

export function joinTrucoTable(table, player) {
  if (table.stage !== "waiting") {
    throw new Error("Esta mesa não está mais aceitando jogadores.");
  }

  const aliases = [...new Set((player.aliases || []).map(normalizeJid).filter(Boolean))];
  if (!aliases.length) {
    throw new Error("Não consegui identificar quem quer entrar na mesa.");
  }
  if (table.players[0].aliases.some((alias) => aliases.includes(alias))) {
    throw new Error("Quem abriu a mesa não pode entrar como segundo jogador.");
  }

  table.players.push({
    aliases,
    jid: normalizeJid(player.privateJid) || aliases[0],
    name: player.name || "Jogador 2",
    hand: [],
    tricks: 0,
  });
  dealHand(table, 0);
  return table;
}

export function findPlayerIndex(table, aliases) {
  const normalizedAliases = (aliases || []).map(normalizeJid).filter(Boolean);
  return table.players.findIndex((player) =>
    player.aliases.some((alias) => normalizedAliases.includes(alias)),
  );
}

export function playTrucoCard(table, playerIndex, cardCode) {
  if (table.stage !== "playing") {
    throw new Error("Agora não é possível jogar uma carta.");
  }
  if (table.turnIndex !== playerIndex) {
    throw new Error("Ainda não é a sua vez de jogar.");
  }

  const player = table.players[playerIndex];
  const normalizedSelector = normalizeCardName(cardCode);
  const cardIndex = player.hand.findIndex(
    (card) =>
      card.code === cardCode ||
      normalizeCardName(card.name) === normalizedSelector ||
      normalizeCardName(card.shortName) === normalizedSelector,
  );
  if (cardIndex < 0) {
    throw new Error("Essa carta não está na sua mão.");
  }

  const [card] = player.hand.splice(cardIndex, 1);
  table.cardsOnTable.push({ playerIndex, card });

  if (table.cardsOnTable.length === 1) {
    table.turnIndex = 1 - playerIndex;
    return {
      card,
      trickComplete: false,
      nextPlayerIndex: table.turnIndex,
    };
  }

  const [firstPlay, secondPlay] = table.cardsOnTable;
  const trickWinner =
    firstPlay.card.strength === secondPlay.card.strength
      ? null
      : firstPlay.card.strength > secondPlay.card.strength
        ? firstPlay.playerIndex
        : secondPlay.playerIndex;
  if (trickWinner !== null) {
    table.players[trickWinner].tricks += 1;
  }
  table.trickWinners.push(trickWinner);
  table.cardsOnTable = [];

  const handComplete =
    table.players.some((entry) => entry.tricks >= 2) ||
    table.trickWinners.length === 3;
  if (!handComplete) {
    table.turnIndex = trickWinner ?? table.starterIndex;
    return {
      card,
      trickComplete: true,
      trickWinner,
      nextPlayerIndex: table.turnIndex,
    };
  }

  const handWinner = resolveHand(table);
  const handStake = table.stake;
  const result = awardHand(table, handWinner);
  return {
    card,
    trickComplete: true,
    trickWinner,
    handWinner,
    handStake,
    score: [...table.score],
    ...result,
  };
}

export function callTruco(table, playerIndex) {
  if (table.stage !== "playing" || table.turnIndex !== playerIndex) {
    throw new Error("Só pode pedir truco durante a sua vez.");
  }

  const offeredStake = getNextStake(table.stake);
  if (!offeredStake) {
    throw new Error("A mão já está valendo 12 pontos.");
  }

  table.pendingTruco = {
    callerIndex: playerIndex,
    responderIndex: 1 - playerIndex,
    previousStake: table.stake,
    offeredStake,
    resumeTurnIndex:
      table.cardsOnTable.length === 0 ? 1 - playerIndex : playerIndex,
  };
  table.stage = "raising";
  return table.pendingTruco;
}

export function answerTruco(table, playerIndex, answer) {
  const pending = table.pendingTruco;
  if (table.stage !== "raising" || !pending) {
    throw new Error("Não há pedido de truco aguardando resposta.");
  }
  if (pending.responderIndex !== playerIndex) {
    throw new Error("Este pedido de truco não é para você responder.");
  }

  if (answer === "aceitar") {
    table.stake = pending.offeredStake;
    table.turnIndex = pending.resumeTurnIndex;
    table.pendingTruco = null;
    table.stage = "playing";
    return { accepted: true, stake: table.stake };
  }

  if (answer === "aumentar") {
    const offeredStake = getNextStake(pending.offeredStake);
    if (!offeredStake) {
      throw new Error("A mão já está valendo 12 pontos.");
    }

    table.pendingTruco = {
      callerIndex: playerIndex,
      responderIndex: pending.callerIndex,
      previousStake: pending.offeredStake,
      offeredStake,
      resumeTurnIndex: pending.resumeTurnIndex,
    };
    return { raised: true, ...table.pendingTruco };
  }

  if (answer === "correr") {
    const winnerIndex = pending.callerIndex;
    const handStake = pending.previousStake;
    const scoreBeforeAward = [...table.score];
    const result = awardHand(table, winnerIndex, handStake);
    return {
      folded: true,
      winnerIndex,
      handStake,
      score: table.stage === "finished"
        ? [...table.score]
        : scoreBeforeAward.map((score, index) =>
            index === winnerIndex ? score + handStake : score,
          ),
      ...result,
    };
  }

  throw new Error("Resposta inválida. Escolha aceitar, aumentar ou correr.");
}

export function getNextTrucoStake(stake) {
  return getNextStake(stake);
}
