import { createRequire } from "node:module";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const FRAMES_PER_ACTION = 7;

const DOOM_KEYS = {
  right: 0xae,
  left: 0xac,
  up: 0xad,
  down: 0xaf,
  strafe_left: 0xa0,
  strafe_right: 0xa1,
  use: 0xa2,
  fire: 0xa3,
  escape: 27,
  enter: 13,
  run: 0xb6,
};

let activeGame = null;
let startingGame = null;

function loadDoomEngine() {
  try {
    return require("kaboom.claude/src/doom-engine.js").DoomEngine;
  } catch (error) {
    if (
      error?.code === "MODULE_NOT_FOUND" &&
      error.message.includes("kaboom.claude")
    ) {
      throw new Error(
        "Engine DOOM/FreeDoom não instalado. Use Linux ou macOS e instale as dependências opcionais do projeto.",
        { cause: error },
      );
    }

    throw error;
  }
}

function refreshExpiration(session) {
  clearTimeout(session.expirationTimer);
  session.expirationTimer = setTimeout(() => {
    if (activeGame === session) {
      activeGame = null;
    }
  }, IDLE_TIMEOUT_MS);
  session.expirationTimer.unref?.();
}

function isOwner(session, remoteJid, playerId) {
  return session.remoteJid === remoteJid && session.playerId === playerId;
}

function requireOwner(session, remoteJid, playerId) {
  if (!isOwner(session, remoteJid, playerId)) {
    throw new Error(
      "Já há outra partida ativa. Apenas quem iniciou essa sessão pode controlá-la.",
    );
  }
}

function captureFrame(engine) {
  const frame = engine.frame();

  if (!frame || frame.length !== engine.width * engine.height * 4) {
    throw new Error("O engine DOOM ainda não produziu um quadro válido.");
  }

  return sharp(Buffer.from(frame), {
    raw: {
      width: engine.width,
      height: engine.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

function tap(engine, key, ticks = 5) {
  engine.pushKey(true, key);
  for (let frame = 0; frame < ticks; frame += 1) {
    engine.tick();
  }
  engine.pushKey(false, key);
  engine.tick();
}

export async function startDoomGame({ remoteJid, playerId }) {
  if (activeGame) {
    requireOwner(activeGame, remoteJid, playerId);
    refreshExpiration(activeGame);
    return captureFrame(activeGame.engine);
  }

  if (startingGame) {
    const session = await startingGame;
    requireOwner(session, remoteJid, playerId);
    refreshExpiration(session);
    return captureFrame(session.engine);
  }

  const startPromise = (async () => {
    const DoomEngine = loadDoomEngine();
    const engine = new DoomEngine();
    await engine.init();

    for (let frame = 0; frame < 20; frame += 1) {
      engine.tick();
    }

    for (let selection = 0; selection < 4; selection += 1) {
      tap(engine, DOOM_KEYS.enter);
    }

    activeGame = {
      engine,
      remoteJid,
      playerId,
      expirationTimer: null,
    };
    refreshExpiration(activeGame);
    return activeGame;
  })();
  startingGame = startPromise;

  try {
    const session = await startPromise;
    return captureFrame(session.engine);
  } finally {
    if (startingGame === startPromise) {
      startingGame = null;
    }
  }
}

export async function controlDoomGame({
  remoteJid,
  playerId,
  action,
}) {
  if (!activeGame) {
    throw new Error("Não há uma partida ativa. Use /doom start para começar.");
  }

  requireOwner(activeGame, remoteJid, playerId);
  const engine = activeGame.engine;

  if (action === "run") {
    engine.pushKey(true, DOOM_KEYS.run);
    engine.pushKey(true, DOOM_KEYS.up);
    for (let frame = 0; frame < FRAMES_PER_ACTION; frame += 1) {
      engine.tick();
    }
    engine.pushKey(false, DOOM_KEYS.up);
    engine.pushKey(false, DOOM_KEYS.run);
    engine.tick();
  } else {
    const key = DOOM_KEYS[action];
    if (key === undefined) {
      throw new Error(`Ação de jogo não suportada: ${action}`);
    }

    tap(engine, key, action === "fire" ? 2 : FRAMES_PER_ACTION);
  }

  refreshExpiration(activeGame);
  return captureFrame(engine);
}

export function getDoomGameFrame({ remoteJid, playerId }) {
  if (!activeGame) {
    throw new Error("Não há uma partida ativa. Use /doom start para começar.");
  }

  requireOwner(activeGame, remoteJid, playerId);
  refreshExpiration(activeGame);
  return captureFrame(activeGame.engine);
}

export function stopDoomGame({ remoteJid, playerId }) {
  if (!activeGame) {
    return false;
  }

  requireOwner(activeGame, remoteJid, playerId);
  clearTimeout(activeGame.expirationTimer);
  activeGame = null;
  return true;
}
