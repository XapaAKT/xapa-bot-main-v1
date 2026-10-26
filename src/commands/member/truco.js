import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import {
  answerTruco,
  callTruco,
  chooseTrucoMode,
  createTrucoTable,
  findPlayerIndex,
  getNextTrucoStake,
  getTrucoTable,
  getTrucoTableById,
  joinTrucoTable,
  playTrucoCard,
  removeTrucoTable,
} from "../../services/truco.js";
import {
  createNativeFlowButton,
  sendNativeFlowButtons,
} from "../../utils/interactive.js";
import { getUserName } from "../../utils/index.js";
import { errorLog } from "../../utils/logger.js";

function getPlayerIdentity(userLid, webMessage, remoteJid) {
  const key = webMessage?.key || {};
  const aliases = [
    userLid,
    key.participant,
    key.participantAlt,
    key.senderLid,
    key.senderPn,
    key.remoteJidAlt,
    remoteJid?.endsWith("@g.us") ? null : remoteJid,
  ].filter(Boolean);
  const privateJid =
    [key.participantAlt, key.senderPn, userLid, key.participant, remoteJid]
      .find((jid) => jid && !jid.endsWith("@g.us")) || "";

  return { aliases, privateJid };
}

function getCommandArgs(fullArgs) {
  return fullArgs?.trim().split(/\s+/).filter(Boolean) || [];
}

function button(text, command) {
  return createNativeFlowButton("quick_reply", {
    display_text: text,
    id: command,
  });
}

function scoreLine(table) {
  return `${table.players[0].name} ${table.score[0]} × ${table.score[1]} ${table.players[1].name}`;
}

function turnMessage(table, index) {
  return `🎴 Vez de *${table.players[index].name}*.\n` +
    `Placar: ${scoreLine(table)} | Mão valendo ${table.stake} ponto(s).\n` +
    `Para pedir truco: ${table.groupPrefix}truco-pedir ${table.id}`;
}

async function sendPrivateHand(socket, table, playerIndex) {
  const player = table.players[playerIndex];
  const cards = player.hand.map((card) =>
    button(
      `Jogar ${card.shortName}`,
      `${PREFIX}truco-jogar ${table.id} ${card.code}`,
    ),
  );

  await sendNativeFlowButtons(socket, player.jid, {
    title: "⛓️ Sua mão de truco",
    text:
      `Mesa ${table.id} • Mão valendo ${table.stake} ponto(s)\n` +
      `Placar: ${scoreLine(table)}\n\n` +
      player.hand
        .map((card) => `🃏 ${card.name}${card.isManilha ? " — MANILHA" : ""}`)
        .join("\n") +
      (table.turnIndex === playerIndex
        ? "\n\nÉ sua vez. Toque em uma carta para jogar."
        : `\n\nAguarde a jogada de ${table.players[table.turnIndex].name}.`) +
      `\n\nOu jogue pelo grupo ou no privado com:\n${PREFIX}truco-jogar ${table.id} <nome da carta>` +
      `\nPara pedir truco: ${PREFIX}truco-pedir ${table.id}`,
    footer: "Suas cartas são privadas. Não encaminhe esta mensagem.",
    buttons: cards,
  });
}

async function sendTrucoChallenge(socket, table) {
  const pending = table.pendingTruco;
  const responder = table.players[pending.responderIndex];
  const challenger = table.players[pending.callerIndex];
  const createResponseButtons = (prefix) => [
    button("Aceitar", `${prefix}truco-responder ${table.id} aceitar`),
    ...(getNextTrucoStake(pending.offeredStake)
      ? [button("Aumentar", `${prefix}truco-responder ${table.id} aumentar`)]
      : []),
    button("Correr", `${prefix}truco-responder ${table.id} correr`),
  ];
  const text =
    `🃏 *${challenger.name} pediu ${pending.offeredStake}!*` +
    `\n${responder.name}, escolha aceitar, aumentar ou correr.`;

  await sendNativeFlowButtons(socket, table.groupId, {
    title: "⛓️ Desafio de truco",
    text,
    footer: `A mão já valia ${pending.previousStake} ponto(s).`,
    buttons: createResponseButtons(table.groupPrefix),
  });
  await sendNativeFlowButtons(socket, responder.jid, {
    title: "⛓️ Responda ao truco",
    text,
    footer: `Placar: ${scoreLine(table)}`,
    buttons: createResponseButtons(PREFIX),
  });
}

function getTableOrThrow(groupId, tableId) {
  const table = groupId
    ? getTrucoTable(groupId, tableId)
    : getTrucoTableById(tableId);
  if (!table) {
    throw new Error("Esta mesa não existe mais ou o jogo já terminou.");
  }
  return table;
}

async function startTable({
  socket,
  remoteJid,
  prefix,
  userLid,
  webMessage,
  sendReply,
}) {
  if (!remoteJid?.endsWith("@g.us")) {
    await sendReply("⛓️ Abra a mesa em um grupo; depois, cada jogador pode jogar pelo grupo ou no privado do bot.");
    return;
  }

  const identity = getPlayerIdentity(userLid, webMessage, remoteJid);
  let table;
  try {
    table = createTrucoTable(remoteJid, {
      ...identity,
      name: getUserName(webMessage, userLid, "Jogador 1"),
    });
    const activePrefix = prefix || PREFIX;
    table.groupPrefix = activePrefix;
    await sendNativeFlowButtons(socket, remoteJid, {
      title: "⛓️ Mesa de Truco",
      text:
        `Mesa ${table.id}\n` +
        "🩸 As cartas aguardam seus jogadores.\n" +
        "Escolha o formato da mesa para começar.\n" +
        "No 1 × 1, a partida vai até 12 pontos; peça truco para aumentar o valor da mão.",
      footer: "Mineiro: 4♣ > 7♥ > Ás♠ > 7♦",
      buttons: [
        button("1 × 1", `${activePrefix}truco-modo ${table.id} 1`),
        button("2 × 2", `${activePrefix}truco-modo ${table.id} 2`),
      ],
    });
  } catch (error) {
    if (table) removeTrucoTable(table);
    throw error;
  }
}

async function handleMode({
  args,
  remoteJid,
  userLid,
  webMessage,
  socket,
  prefix,
  sendReply,
}) {
  const [tableId, mode] = args;
  const table = getTableOrThrow(remoteJid, tableId);
  const playerIndex = findPlayerIndex(
    table,
    getPlayerIdentity(userLid, webMessage, remoteJid).aliases,
  );
  if (playerIndex !== 0) {
    await sendReply("Somente quem abriu a mesa pode escolher o formato.");
    return;
  }

  if (mode === "2") {
    await sendReply(
      "🩸 O modo 2 × 2 ainda está sendo preparado. Escolha 1 × 1 para abrir esta mesa.",
    );
    return;
  }
  if (mode !== "1") {
    throw new InvalidParameterError(`Escolha 1 × 1 ou 2 × 2 na mesa.`);
  }

  chooseTrucoMode(table, "1x1");
  const activePrefix = table.groupPrefix;
  await sendNativeFlowButtons(socket, remoteJid, {
    title: "🃏 Truco 1 × 1",
    text:
      `Mesa ${table.id}\n` +
      `*${table.players[0].name}* abriu a mesa.\n` +
      "Quem aceita o desafio e encara a primeira mão?",
    footer: "Toque no botão para sentar à mesa.",
    buttons: [
      button("Aceitar o desafio", `${activePrefix}truco-entrar ${table.id}`),
    ],
  });
}

async function handleJoin({
  args,
  remoteJid,
  userLid,
  webMessage,
  socket,
  sendReply,
}) {
  if (!remoteJid?.endsWith("@g.us")) {
    await sendReply("Entre na mesa pelo botão enviado no grupo.");
    return;
  }

  const table = getTableOrThrow(remoteJid, args[0]);
  const identity = getPlayerIdentity(userLid, webMessage, remoteJid);
  joinTrucoTable(table, {
    ...identity,
    name: getUserName(webMessage, userLid, "Jogador 2"),
  });

  try {
    await sendReply(
      `⛓️ *Mesa ${table.id} iniciada!*\n` +
        `${table.players[0].name} contra ${table.players[1].name}.\n` +
        `A vez é de ${table.players[0].name}. As cartas foram enviadas em particular.\n` +
        "A primeira mão vale 2 pontos; a partida termina em 12.",
    );
    await Promise.all([
      sendPrivateHand(socket, table, 0),
      sendPrivateHand(socket, table, 1),
    ]);
  } catch (error) {
    removeTrucoTable(table);
    errorLog(`[TRUCO] Não foi possível entregar as cartas: ${error.stack || error.message}`);
    await sendReply(
      "Não consegui enviar as cartas em privado. A mesa foi encerrada; confira se o bot pode iniciar uma conversa com os jogadores e tente novamente.",
    );
  }
}

async function handlePlay({
  fullArgs,
  remoteJid,
  userLid,
  webMessage,
  socket,
  prefix,
  sendReply,
}) {
  const [tableId, ...cardNameParts] = getCommandArgs(fullArgs);
  const cardName = cardNameParts.join(" ");
  if (!tableId || !cardName) {
    throw new InvalidParameterError(
      `Use ${prefix || PREFIX}truco-jogar <mesa> <nome da carta> ou toque em uma carta na mensagem privada do bot.`,
    );
  }

  const table = getTableOrThrow(null, tableId);
  const playerIndex = findPlayerIndex(
    table,
    getPlayerIdentity(userLid, webMessage, remoteJid).aliases,
  );
  if (playerIndex < 0) {
    await sendReply("Você não está participando desta mesa.");
    return;
  }

  const result = playTrucoCard(table, playerIndex, cardName);
  const player = table.players[playerIndex];
  const announcement =
    `🃏 *${player.name}* jogou *${result.card.name}*.\n` +
    (result.trickComplete
      ? result.trickWinner === null
        ? "⚖️ A rodada empatou."
        : `🏅 ${table.players[result.trickWinner].name} venceu a rodada.`
      : "");

  if (result.matchWinner !== undefined) {
    removeTrucoTable(table);
    await socket.sendMessage(table.groupId, {
      text:
        `${announcement}\n\n` +
        `🏆 *${table.players[result.matchWinner].name} venceu a partida!*` +
        `\nPlacar final: ${scoreLine(table)}.`,
    });
    return;
  }

  if (result.handWinner !== undefined) {
    const message =
      `${announcement}\n\n` +
      `✦ ${table.players[result.handWinner].name} levou a mão e marcou ${result.handStake} ponto(s).` +
      `\nPlacar: ${scoreLine(table)}.` +
      (result.nextHand
        ? `\n\nA próxima mão começou. ${table.players[table.turnIndex].name} abre as cartas.`
        : "");
    await socket.sendMessage(table.groupId, { text: message });
    if (result.nextHand) {
      await Promise.all([
        sendPrivateHand(socket, table, 0),
        sendPrivateHand(socket, table, 1),
      ]);
    } else {
      removeTrucoTable(table);
    }
    return;
  }

  if (result.trickComplete) {
    await socket.sendMessage(table.groupId, {
      text:
        `${announcement}\n\n` +
        turnMessage(table, result.nextPlayerIndex),
    });
  } else {
    await socket.sendMessage(table.groupId, {
      text:
        `${announcement}\n` +
        `Agora é a vez de *${table.players[result.nextPlayerIndex].name}*.`,
    });
  }
  await sendPrivateHand(socket, table, result.nextPlayerIndex);

  if (remoteJid !== table.groupId) {
    await sendReply(`Jogada registrada na mesa ${table.id}.`);
  }
}

async function handleCall({
  args,
  remoteJid,
  userLid,
  webMessage,
  socket,
  sendReply,
}) {
  const table = getTableOrThrow(null, args[0]);
  const playerIndex = findPlayerIndex(
    table,
    getPlayerIdentity(userLid, webMessage, remoteJid).aliases,
  );
  if (playerIndex < 0) {
    await sendReply("Você não está participando desta mesa.");
    return;
  }

  callTruco(table, playerIndex);
  await sendTrucoChallenge(socket, table);
}

async function handleAnswer({
  args,
  remoteJid,
  userLid,
  webMessage,
  socket,
  sendReply,
}) {
  const [tableId, answer] = args;
  const table = getTableOrThrow(null, tableId);
  const playerIndex = findPlayerIndex(
    table,
    getPlayerIdentity(userLid, webMessage, remoteJid).aliases,
  );
  if (playerIndex < 0) {
    await sendReply("Você não está participando desta mesa.");
    return;
  }

  const result = answerTruco(table, playerIndex, answer);
  if (result.raised) {
    await sendTrucoChallenge(socket, table);
    return;
  }

  if (result.folded) {
    if (result.matchWinner !== undefined) {
      removeTrucoTable(table);
      await socket.sendMessage(table.groupId, {
        text:
          `🏳️ ${table.players[playerIndex].name} correu.\n` +
          `🏆 *${table.players[result.winnerIndex].name} venceu a partida!*` +
          `\nPlacar final: ${scoreLine(table)}.`,
      });
      return;
    }

    await socket.sendMessage(table.groupId, {
      text:
        `🏳️ ${table.players[playerIndex].name} correu do pedido.\n` +
        `${table.players[result.winnerIndex].name} levou ${result.handStake} ponto(s).` +
        `\nPlacar: ${scoreLine(table)}.\n` +
        `\nA próxima mão começou. ${table.players[table.turnIndex].name} abre.`,
    });
    await Promise.all([
      sendPrivateHand(socket, table, 0),
      sendPrivateHand(socket, table, 1),
    ]);
    return;
  }

  await socket.sendMessage(table.groupId, {
    text:
      `✅ Truco aceito! A mão agora vale ${result.stake} ponto(s).\n` +
      turnMessage(table, table.turnIndex),
  });
  await sendPrivateHand(socket, table, table.turnIndex);
}

async function handleCancel({
  args,
  remoteJid,
  userLid,
  webMessage,
  sendReply,
}) {
  const table = getTableOrThrow(null, args[0]);
  const playerIndex = findPlayerIndex(
    table,
    getPlayerIdentity(userLid, webMessage, remoteJid).aliases,
  );
  if (playerIndex < 0) {
    await sendReply("Somente quem está na mesa pode encerrá-la.");
    return;
  }

  removeTrucoTable(table);
  await sendReply(`⛓️ A mesa ${table.id} foi encerrada.`);
}

export default {
  name: "truco",
  description: "Abre uma mesa de truco mineiro 1 × 1.",
  commands: [
    "truco",
    "truco-modo",
    "truco-entrar",
    "truco-jogar",
    "truco-pedir",
    "truco-responder",
    "truco-cancelar",
  ],
  usage: `${PREFIX}truco`,

  handle: async (props) => {
    const {
      commandName,
      fullArgs,
      remoteJid,
      sendReply,
    } = props;
    const args = getCommandArgs(fullArgs);

    try {
      switch (commandName) {
        case "truco":
          return await startTable(props);
        case "trucomodo":
          return await handleMode({ ...props, args });
        case "trucoentrar":
          return await handleJoin({ ...props, args });
        case "trucojogar":
          return await handlePlay(props);
        case "trucopedir":
          return await handleCall({ ...props, args });
        case "trucoresponder":
          return await handleAnswer({ ...props, args });
        case "trucocancelar":
          return await handleCancel({ ...props, args });
        default:
          await sendReply(
            `Use ${props.prefix || PREFIX}truco para abrir uma mesa no grupo, ou ${props.prefix || PREFIX}truco-cancelar <mesa> para encerrar uma partida.`,
          );
      }
    } catch (error) {
      const tableId = args[0];
      const table = tableId ? getTrucoTableById(tableId) : null;
      const identity = getPlayerIdentity(
        props.userLid,
        props.webMessage,
        remoteJid,
      );
      if (table && error instanceof Error) {
        const participantIndex = findPlayerIndex(table, identity.aliases);
        if (participantIndex >= 0) {
          await sendReply(`🃏 ${error.message}`);
          return;
        }
      }
      errorLog(`[TRUCO] ${error.stack || error.message || error}`);
      await sendReply(`🃏 Não consegui concluir essa ação: ${error.message}`);
    }
  },
};
