import fs from "fs";
import { PREFIX } from "../../config.js";

const VIP_FILE = "./assets/vip.json";

function readVip() {
  try {
    if (!fs.existsSync(VIP_FILE)) return [];
    const raw = fs.readFileSync(VIP_FILE, "utf8").trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveVip(vip) {
  fs.writeFileSync(VIP_FILE, JSON.stringify(vip, null, 2));
}

function getContextInfo(webMessage) {
  return (
    webMessage?.message?.extendedTextMessage?.contextInfo ||
    webMessage?.message?.imageMessage?.contextInfo ||
    webMessage?.message?.videoMessage?.contextInfo ||
    webMessage?.message?.documentMessage?.contextInfo ||
    webMessage?.message?.buttonsResponseMessage?.contextInfo ||
    webMessage?.message?.templateButtonReplyMessage?.contextInfo ||
    webMessage?.message?.listResponseMessage?.contextInfo ||
    null
  );
}

function extractTargetJid({ args, webMessage }) {
  const ctx = getContextInfo(webMessage);

  const mentioned = ctx?.mentionedJid?.[0];
  if (mentioned) return mentioned;

  const repliedParticipant = ctx?.participant;
  if (repliedParticipant && repliedParticipant.includes("@")) {
    return repliedParticipant;
  }

  const firstArg = args?.[0] ?? "";
  if (!firstArg) return null;

  const digits = firstArg.replace(/\D/g, "");
  if (!digits) return null;

  if (firstArg.startsWith("@")) return `${digits}@s.whatsapp.net`;
  if (firstArg.includes("@")) return firstArg;

  if (digits.length >= 8) return `${digits}@s.whatsapp.net`;

  return null;
}

function extractDays(args) {
  const numericArgs = (args || []).filter((a) => /^\d+$/.test(a));
  if (!numericArgs.length) return null;
  return Number(numericArgs[numericArgs.length - 1]);
}

export default {
  name: "addvip",
  description: "Adiciona um usuário ao sistema VIP.",
  commands: ["addvip"],
  usage: `${PREFIX}addvip @usuario 30`,

  handle: async ({ args, sendReply, webMessage }) => {
    try {
      const targetJid = extractTargetJid({ args, webMessage });
      const dias = extractDays(args);

      if (!targetJid || dias === null || Number.isNaN(dias)) {
        return sendReply(`
▓▒░ 𝕏𝕀ℂ://𝕍𝕀𝕻_𝕹𝕺𝕯𝔼 ░▒▓

☠ 𝕱𝕺𝕽𝕸𝔸𝕋𝕆 𝕀ℕ𝕍𝔸𝕃𝕀𝔻𝕆

▌${PREFIX}addvip @usuario 30
▌${PREFIX}addvip 5511999999999 30
▌${PREFIX}addvip (respondendo mensagem) 30

𖤐 𝕋ℍ𝔼 𝕹𝕺𝔻𝔼 𝕀𝕊 𝕊𝕋𝕀𝕃𝕃 𝔸𝕃𝕀𝕍𝔼
`);
      }

      const vip = readVip();

      const existing = vip.find((v) => v.id === targetJid);

      if (existing) {
        if (existing.infinito) {
          return sendReply(`
▓▒░ 𝕏𝕀ℂ://𝕍𝕀𝕻_𝕹𝕺𝔻𝔼 ░▒▓

⚠ 𝕌𝕊𝔼ℝ 𝔸𝕃𝕽𝔼𝔸𝔻𝕐 𝕊𝔼𝕋 𝕋𝕆 𝕀ℕ𝔽𝕀ℕ𝕀𝕋𝔼

▌𝕌𝕊𝔼ℝ :: @${targetJid.split("@")[0]}
▌𝕊𝕋𝔸𝕋𝕌𝕊 :: 𝕍𝕀𝕻_∞

𖤐 𝕊𝕐𝕊𝕋𝔼𝕄 𝕽𝔼𝕄𝔼𝕄𝕭𝔼ℝ𝕊
`);
        }

        if (dias === 0) {
          existing.dias = 0;
          existing.infinito = true;
        } else {
          existing.dias += dias;
        }

        saveVip(vip);

        return sendReply(`
▓▒░ 𝕏𝕀ℂ://𝕍𝕀𝕻_𝕌ℙ𝔻𝔸𝕋𝔼 ░▒▓

☣ 𝔸ℂℂ𝔼𝕊𝕊 𝔾ℝ𝔸ℕ𝕋𝔼𝔻 ☣

▌𝕌𝕊𝔼ℝ :: @${targetJid.split("@")[0]}
▌𝕊𝕋𝔸𝕋𝕌𝕊 :: 𝕍𝕀𝕻 ${existing.infinito ? "∞" : ""}
▌𝔻𝔸𝕐𝕊 :: ${existing.infinito ? "𝕀ℕ𝔽𝕀ℕ𝕀𝕋𝔼" : existing.dias}

𖤐 𝕋ℍ𝔼 𝕹𝕺𝔻𝔼 𝕴𝕾 𝕾𝕿𝕴𝕷𝕷 𝕬𝕷𝕴𝖁𝕰
`);
      }

      vip.push({
        id: targetJid,
        dias,
        infinito: dias === 0,
      });

      saveVip(vip);

      return sendReply(`
▓▒░ 𝕏𝕀ℂ://𝕍𝕀𝕻_𝕹𝕺𝔻𝔼 ░▒▓

☣ 𝔸ℂℂ𝔼𝕊𝕊 𝔾ℝ𝔸ℕ𝕋𝔼𝔻 ☣

▌𝕌𝕊𝔼ℝ :: @${targetJid.split("@")[0]}
▌𝕊𝕋𝔸𝕋𝕌𝕊 :: ${dias === 0 ? "𝕍𝕀𝕻_∞" : "𝕍𝕀𝕻"}
▌𝔻𝔸𝕐𝕊 :: ${dias === 0 ? "𝕀ℕ𝔽𝕀ℕ𝕀𝕋𝔼" : dias}

𖤐 𝕋ℍ𝔼 𝔼𝕐𝔼 𝕊𝔼𝔼𝕊
𖤐 𝕋ℍ𝔼 𝕹𝕺𝔻𝔼 ℝ𝔼𝕄𝔼𝕄𝔹𝔼ℝ𝕊
𖤐 𝕋ℍ𝔼 𝕹𝕺𝔻𝔼 𝕴𝕾 𝕾𝕿𝕴𝕷𝕷 𝕬𝕷𝕴𝖁𝕰
`);
    } catch (err) {
      console.error(err);
      return sendReply(`
▓▒░ 𝕏𝕀ℂ://𝔼ℝℝ𝕆ℝ ░▒▓

☠ 𝔽𝔸𝕀𝕃𝔼𝔻 𝕋𝕆 𝕌ℙ𝔻𝔸𝕋𝔼 𝕍𝕀ℙ 𝔻𝔸𝕋𝔸
`);
    }
  },
};