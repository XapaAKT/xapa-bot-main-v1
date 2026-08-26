/**
 * AFK personalizado do Rei Sz
 */

import fs from "node:fs";
import path from "node:path";

import { PREFIX } from "../../../config.js";

export const SZ_LID = "146360154206349@lid";

const OFF_IMAGE = path.join(
  process.cwd(),
  "assets",
  "images",
  "personalizado",
  "szOFF.png"
);

const ON_IMAGE = path.join(
  process.cwd(),
  "assets",
  "images",
  "personalizado",
  "szON.png"
);

// AFK separado por grupo
const szAfkGroups = new Set();

function normalizeJid(jid) {
  if (!jid) return null;

  return String(jid)
    .replace(/:[0-9]+(?=@)/g, "")
    .trim();
}

export function isSz(jid) {
  return normalizeJid(jid) === SZ_LID;
}

export function isSzAfk(groupJid) {
  return szAfkGroups.has(groupJid);
}

export function activateSzAfk(groupJid) {
  szAfkGroups.add(groupJid);
}

export function deactivateSzAfk(groupJid) {
  szAfkGroups.delete(groupJid);
}

async function sendSzImage(
  socket,
  groupJid,
  imagePath,
  caption
) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(
      `Imagem não encontrada: ${imagePath}`
    );
  }

  await socket.sendMessage(groupJid, {
    image: fs.readFileSync(imagePath),
    caption,
  });
}

export async function sendSzOff(
  socket,
  groupJid
) {
  await sendSzImage(
    socket,
    groupJid,
    OFF_IMAGE,
`⛧━━━━━<⛧>━━━━━⛓️
┃ 👑 𝐒𝐙 — 𝐑𝐄𝐈
┃ 💤 𝐑𝐄𝐈 𝐒𝐙 𝐎𝐅𝐅
┃
┃ ⛓️ 𝐋𝐨𝐠𝐨 𝐥𝐨𝐠𝐨 𝐞𝐥𝐞 𝐯𝐨𝐥𝐭𝐚.
⛧━━━━━<⛧>━━━━━⛓️`
  );
}

export async function sendSzOn(
  socket,
  groupJid
) {
  await sendSzImage(
    socket,
    groupJid,
    ON_IMAGE,
`⛧━━━━━<⛧>━━━━━⛓️
┃ 👑 𝐒𝐙 — 𝐑𝐄𝐈
┃ 🔥 𝐒𝐙 𝐑𝐄𝐈 𝐎𝐍
┃
┃ ⛓️ 𝐎 𝐑𝐄𝐈 𝐕𝐎𝐋𝐓𝐎𝐔.
⛧━━━━━<⛧>━━━━━⛓️`
  );
}

export default {
  name: "afk",
  description: "Ativa o modo AFK do Rei Sz.",
  commands: ["afk"],
  usage: `${PREFIX}afk`,

  handle: async ({
    userLid,
    remoteJid,
    socket,
    sendReply,
  }) => {

    if (!remoteJid?.endsWith("@g.us")) {
      await sendReply(
`⛧━━━━━<⛧>━━━━━⛓️
┃ ☠️ 𝐄𝐒𝐒𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎
┃    𝐒𝐎́ 𝐅𝐔𝐍𝐂𝐈𝐎𝐍𝐀 𝐄𝐌 𝐆𝐑𝐔𝐏𝐎.
⛧━━━━━<⛧>━━━━━⛓️`
      );
      return;
    }

    if (!isSz(userLid)) {
      await sendReply(
`⛧━━━━━<⛧>━━━━━⛓️
┃ ☠️ 𝐀𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐃𝐎
┃ 👑 𝐒𝐨́ 𝐨 𝐑𝐞𝐢 𝐒𝐳 𝐩𝐨𝐝𝐞
┃    𝐮𝐬𝐚𝐫 𝐞𝐬𝐬𝐞 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.
⛧━━━━━<⛧>━━━━━⛓️`
      );
      return;
    }

    // Se já está AFK, /afk cancela manualmente.
    if (isSzAfk(remoteJid)) {
      deactivateSzAfk(remoteJid);

      await sendSzOn(
        socket,
        remoteJid
      );

      return;
    }

    activateSzAfk(remoteJid);

    await sendSzOff(
      socket,
      remoteJid
    );
  },
};