import fs from "node:fs";
import path from "node:path";
import { ASSETS_DIR } from "./config.js";

const OWNER_NUMBER = "227886971789349@lid";

const COOLDOWN = 10000;

const lastReply = new Map();

const audios = [
  "xing1.mp3",
  // "xing2.mp3",
  // "xing3.mp3",
  // "xing4.mp3",
];

function randomAudio() {
  return audios[Math.floor(Math.random() * audios.length)];
}

export async function handleOwnerReplyAudio({
  webMessage,
  commonFunctions,
}) {
  try {
    const { sendAudioFromFile } = commonFunctions;

    const remoteJid = webMessage.key.remoteJid;

    // Só funciona em grupos
    if (!remoteJid?.endsWith("@g.us")) return;

    // Verifica se a mensagem é uma resposta
    const quoted =
      webMessage.message?.extendedTextMessage?.contextInfo;

    if (!quoted) return;

    // Pessoa que foi respondida
    const participant =
      (quoted.participant || "").replace(/:[0-9]+/g, "");

    // Só dispara se responder ao dono
    if (!participant.includes(OWNER_NUMBER)) return;

    const now = Date.now();

    // Cooldown por grupo
    const last = lastReply.get(remoteJid);

    if (last && now - last < COOLDOWN) {
      return;
    }

    lastReply.set(remoteJid, now);

    const audio = randomAudio();

    const file = path.join(
      ASSETS_DIR,
      "samples",
      audio
    );

    if (!fs.existsSync(file)) {
      console.log("[MSG EVENT] Áudio não encontrado:", file);
      return;
    }

    await sendAudioFromFile(file, true);

  } catch (err) {
    console.log("[MSG EVENT]", err.message);
  }
}