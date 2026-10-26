import assert from "node:assert/strict";
import test from "node:test";
import {
  answerTruco,
  callTruco,
  chooseTrucoMode,
  createTrucoTable,
  createTrucoDeck,
  getTrucoTable,
  joinTrucoTable,
  playTrucoCard,
  removeTrucoTable,
} from "../services/truco.js";

function createPlayingTable(groupId) {
  const table = createTrucoTable(groupId, {
    aliases: ["host@lid"],
    privateJid: "host@lid",
    name: "Mão",
  });
  chooseTrucoMode(table, "1x1");
  joinTrucoTable(table, {
    aliases: ["guest@lid"],
    privateJid: "guest@lid",
    name: "Desafiante",
  });
  return table;
}

test("fixed mineiro manilhas outrank ordinary cards in the right order", () => {
  const deck = createTrucoDeck();
  const strength = (id) => deck.find((card) => card.id === id)?.strength;

  assert.ok(strength("4-paus") > strength("7-copas"));
  assert.ok(strength("7-copas") > strength("1-espadas"));
  assert.ok(strength("1-espadas") > strength("7-ouros"));
  assert.ok(strength("7-ouros") > strength("3-paus"));
  assert.ok(strength("3-paus") > strength("2-paus"));
});

test("truco mineiro opens a unique 1x1 table and deals three cards each", () => {
  const groupId = "truco-deck@g.us";
  const table = createPlayingTable(groupId);

  try {
    assert.equal(getTrucoTable(groupId), table);
    assert.equal(table.players[0].hand.length, 3);
    assert.equal(table.players[1].hand.length, 3);

    const dealtCards = table.players.flatMap((player) => player.hand);
    assert.equal(new Set(dealtCards.map((card) => card.id)).size, 6);
    assert.equal(table.stake, 2);
  } finally {
    removeTrucoTable(table);
  }
});

test("a hand that reaches 12 points ends the match", () => {
  const table = createPlayingTable("truco-match-end@g.us");
  try {
    table.score[0] = 10;
    table.players[0].hand = [
      { id: "zap", name: "4 de paus", shortName: "4 ♣", strength: 17, code: "a" },
      { id: "seven-hearts", name: "7 de copas", shortName: "7 ♥", strength: 16, code: "b" },
      { id: "three", name: "3", shortName: "3", strength: 13, code: "c" },
    ];
    table.players[1].hand = [
      { id: "two", name: "2", shortName: "2", strength: 12, code: "d" },
      { id: "ace", name: "Ás", shortName: "Ás", strength: 11, code: "e" },
      { id: "four", name: "4", shortName: "4", strength: 4, code: "f" },
    ];

    playTrucoCard(table, 0, "a");
    playTrucoCard(table, 1, "d");
    playTrucoCard(table, 0, "b");
    const result = playTrucoCard(table, 1, "e");

    assert.equal(result.matchWinner, 0);
    assert.deepEqual(result.score, [12, 0]);
    assert.equal(table.stage, "finished");
  } finally {
    removeTrucoTable(table);
  }
});

test("only the player whose turn it is can play", () => {
  const table = createPlayingTable("truco-turn@g.us");
  try {
    assert.throws(
      () => playTrucoCard(table, 1, table.players[1].hand[0].code),
      /Ainda não é a sua vez/,
    );
  } finally {
    removeTrucoTable(table);
  }
});

test("winning two tricks awards the accepted hand stake and deals a new hand", () => {
  const table = createPlayingTable("truco-points@g.us");
  try {
    table.players[0].hand = [
      { id: "zap", name: "4 de paus", shortName: "4 ♣", strength: 17, code: "a" },
      { id: "seven-hearts", name: "7 de copas", shortName: "7 ♥", strength: 16, code: "b" },
      { id: "three", name: "3", shortName: "3", strength: 13, code: "c" },
    ];
    table.players[1].hand = [
      { id: "two", name: "2", shortName: "2", strength: 12, code: "d" },
      { id: "ace", name: "Ás", shortName: "Ás", strength: 11, code: "e" },
      { id: "four", name: "4", shortName: "4", strength: 4, code: "f" },
    ];

    playTrucoCard(table, 0, "a");
    playTrucoCard(table, 1, "d");
    playTrucoCard(table, 0, "b");
    const result = playTrucoCard(table, 1, "e");

    assert.equal(result.handWinner, 0);
    assert.equal(result.handStake, 2);
    assert.deepEqual(result.score, [2, 0]);
    assert.equal(result.nextHand, true);
    assert.equal(table.players[0].hand.length, 3);
    assert.equal(table.turnIndex, 0);
  } finally {
    removeTrucoTable(table);
  }
});

test("a declined truco awards the previously accepted stake", () => {
  const table = createPlayingTable("truco-fold@g.us");
  try {
    callTruco(table, 0);
    const result = answerTruco(table, 1, "correr");

    assert.equal(result.folded, true);
    assert.equal(result.handStake, 2);
    assert.deepEqual(result.score, [2, 0]);
    assert.equal(result.nextHand, true);
    assert.equal(table.stage, "playing");
  } finally {
    removeTrucoTable(table);
  }
});

test("accepting truco raises the stake and gives the responder the turn", () => {
  const table = createPlayingTable("truco-accept@g.us");
  try {
    callTruco(table, 0);
    const result = answerTruco(table, 1, "aceitar");

    assert.equal(result.accepted, true);
    assert.equal(result.stake, 4);
    assert.equal(table.turnIndex, 1);
    assert.equal(table.stage, "playing");
  } finally {
    removeTrucoTable(table);
  }
});

test("accepting a truco after the first card preserves the current player's turn", () => {
  const table = createPlayingTable("truco-after-card@g.us");
  try {
    playTrucoCard(table, 0, table.players[0].hand[0].code);
    callTruco(table, 1);
    const result = answerTruco(table, 0, "aceitar");

    assert.equal(result.stake, 4);
    assert.equal(table.turnIndex, 1);
    assert.equal(table.cardsOnTable.length, 1);
  } finally {
    removeTrucoTable(table);
  }
});

test("raising a challenge and folding awards the previously offered stake", () => {
  const table = createPlayingTable("truco-raise@g.us");
  try {
    callTruco(table, 0);
    const raise = answerTruco(table, 1, "aumentar");

    assert.equal(raise.raised, true);
    assert.equal(raise.previousStake, 4);
    assert.equal(raise.offeredStake, 6);

    const result = answerTruco(table, 0, "correr");
    assert.equal(result.winnerIndex, 1);
    assert.equal(result.handStake, 4);
    assert.deepEqual(result.score, [0, 4]);
  } finally {
    removeTrucoTable(table);
  }
});
