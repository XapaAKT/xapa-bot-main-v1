import fs from "node:fs";
import path from "node:path";
import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";

const FUNNY_DIR = path.resolve(process.cwd(), "assets", "images", "funny");
const MEDIA = ["cuspir1.mp4", "cuspir2.mp4", "cuspir3.mp4"];

function normalizeJid(jid) {
  return String(jid || "").replace(/:[0-9]+(?=@)/g, "").trim();
}

function getTargetJid(webMessage) {
  // 1. Tenta por menção
  const mentioned =
    webMessage?.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    webMessage?.message?.imageMessage?.contextInfo?.mentionedJid ||
    webMessage?.message?.videoMessage?.contextInfo?.mentionedJid ||
    [];

  if (mentioned.length) return normalizeJid(mentioned[0]);

  // 2. Tenta por reply (responder mensagem)
  const quoted =
    webMessage?.message?.extendedTextMessage?.contextInfo?.participant ||
    webMessage?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.participant;

  if (quoted) return normalizeJid(quoted);

  const stanzaId = webMessage?.message?.extendedTextMessage?.contextInfo?.stanzaId;
  const quotedMessage = webMessage?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (stanzaId && quotedMessage) {
     // Fallback: pega participant do reply
     const replyJid = webMessage?.message?.extendedTextMessage?.contextInfo?.participant;
     if(replyJid) return normalizeJid(replyJid);
  }

  return null;
}

export default {
  name: "cuspir",
  description: "Cuspe virtual",
  commands: ["cuspir", "cuspiu", "cuspe"],
  usage: `${PREFIX}cuspir @membro ou responda a msg`,

  handle: async ({ remoteJid, socket, webMessage, sendReply, sendWaitReact, sendSuccessReact }) => {
    try {
      let targetJid = getTargetJid(webMessage);

      if (!targetJid) {
        throw new InvalidParameterError(
          `Marque alguém ou responda a mensagem da pessoa.\n\nEx: ${PREFIX}cuspir @fulano\nOu responda a msg dele com ${PREFIX}cuspir`
        );
      }

      const senderJid = normalizeJid(webMessage?.key?.participant || webMessage?.key?.senderPn);
      if (targetJid === senderJid) {
        await sendReply("🤮 Você não pode cuspir em você mesmo, né?");
        return;
      }

      const available = MEDIA.filter(f => fs.existsSync(path.join(FUNNY_DIR, f)));
      if (!available.length) {
        await sendReply("💀 Sem mídia na pasta funny.");
        return;
      }

      const file = available[Math.floor(Math.random() * available.length)];
      const filePath = path.join(FUNNY_DIR, file);

      if (sendWaitReact) await sendWaitReact();

      const s = `@${senderJid.split("@")[0]}`;
      const t = `@${targetJid.split("@")[0]}`;

      const captions = [
        `🤮 ${s} cuspiu na cara de ${t} sem dó nenhuma!`,
        `💦 PLOFT! ${s} tacou uma cusparada em ${t}. Que nojo!`,
        `╭━━━〔 🤮 〕━━━╮\n┃ ${s} → 💦 → ${t}\n┃ Motivo: nenhum\n╰━━━━━━━━━━━━╯`,
        `☠️ ${t} foi oficialmente cuspido por ${s}. F total.`,
        `💦 ${s} cuspiu em ${t} e saiu andando como se nada tivesse acontecido.`,
        `🗿 ${t} acaba de receber uma cusparada premium de ${s}.`,
        `🤮 ATAQUE DE CUSPE ATIVADO!\n${s} 💦💦💦 ${t}`,
        `💀 ${s} humilhou ${t} com uma cusparada lendária.`,
      ];

      const caption = captions[Math.floor(Math.random() * captions.length)];

      await socket.sendMessage(remoteJid, {
        video: fs.readFileSync(filePath),
        caption,
        gifPlayback: true,
        mentions: [targetJid, senderJid],
      });

      if (sendSuccessReact) await sendSuccessReact();
    } catch (e) {
      console.error(e);
      await sendReply(e.message || "Erro na cusparada.");
    }
  },
};