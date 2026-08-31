import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { BOT_LID, OWNER_LID, PREFIX } from "../../config.js";
import { DangerError, InvalidParameterError } from "../../errors/index.js";
import { onlyNumbers } from "../../utils/index.js";
import { errorLog } from "../../utils/logger.js";

function normalizeJid(value = "") {
  return String(value).replace(/:[0-9]+(?=@)/g, "").trim();
}

function sameJid(left, right) {
  return normalizeJid(left) === normalizeJid(right);
}

const BAN_STICKERS_DIR = path.resolve(
  process.cwd(),
  "assets",
  "images",
  "personalizado",
  "xapa",
);

function getRandomBanSticker() {
  const stickers = fs
    .readdirSync(BAN_STICKERS_DIR, { withFileTypes: true })
    .filter((file) => file.isFile() && /^ban\d+\.webp$/i.test(file.name))
    .map((file) => path.join(BAN_STICKERS_DIR, file.name));

  return stickers[Math.floor(Math.random() * stickers.length)] || null;
}

function getDirectStickerMessage(webMessage) {
  const message = webMessage?.message;
  return (
    message?.stickerMessage ||
    message?.ephemeralMessage?.message?.stickerMessage ||
    message?.viewOnceMessage?.message?.stickerMessage ||
    message?.viewOnceMessageV2?.message?.stickerMessage ||
    null
  );
}

async function fileHash(filePath) {
  const content = await fs.promises.readFile(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

export async function isOfficialBanSticker({ webMessage, downloadSticker }) {
  if (!getDirectStickerMessage(webMessage) || !downloadSticker) return false;

  try {
    const stickerPath = await downloadSticker(
      webMessage,
      `ban-command-${Date.now()}`,
    );
    if (!stickerPath) return false;

    const receivedHash = await fileHash(stickerPath);
    const officialStickers = fs
      .readdirSync(BAN_STICKERS_DIR, { withFileTypes: true })
      .filter((file) => file.isFile() && /^ban\d+\.webp$/i.test(file.name))
      .map((file) => path.join(BAN_STICKERS_DIR, file.name));

    for (const officialSticker of officialStickers) {
      if (receivedHash === await fileHash(officialSticker)) return true;
    }
  } catch (error) {
    errorLog(`[BAN STICKER] Não foi possível validar a figurinha: ${error.message}`);
  }

  return false;
}

export async function handleBan({
    args,
    isReply,
    socket,
    remoteJid,
    replyLid,
    sendReply,
    sendStickerFromFile,
    userLid,
    webMessage,
    sendSuccessReact,
    sendErrorReply,
}) {
  try {
    const callerId = userLid || webMessage?.key?.participant;

    if (!remoteJid?.endsWith("@g.us")) {
      throw new DangerError("Este comando só pode ser usado em grupos.");
    }

    if (!args.length && !isReply) {
        throw new InvalidParameterError(
          "Você precisa mencionar ou responder uma mensagem!",
        );
    }

      if (args.length && !args[0].includes("@")) {
        throw new InvalidParameterError(
          'Mencione um membro com "@"!',
        );
    }

      const userId = args[0] ? `${onlyNumbers(args[0])}@lid` : null;

    const memberToRemoveLid = normalizeJid(isReply ? replyLid : userId);

      if (!memberToRemoveLid) {
        throw new InvalidParameterError("Membro inválido!");
      }

    if (sameJid(memberToRemoveLid, callerId)) {
        throw new DangerError("Você não pode remover você mesmo!");
      }

    if (sameJid(memberToRemoveLid, OWNER_LID)) {
        throw new DangerError("Você não pode remover o dono do bot!");
      }

    if (sameJid(memberToRemoveLid, BOT_LID)) {
        throw new DangerError("Você não pode me remover!");
      }

    await socket.groupParticipantsUpdate(remoteJid, [memberToRemoveLid], "remove");

      await sendSuccessReact();
      await sendReply("✅ Membro removido do grupo com sucesso!");

      if (sendStickerFromFile) {
        const sticker = getRandomBanSticker();
        if (sticker) await sendStickerFromFile(sticker);
      }
      } catch (error) {
      errorLog(JSON.stringify(error, null, 2));
    await sendErrorReply(`Ocorreu um erro ao remover o membro: ${error.message}`);
  }
}

export default {
  name: "ban",
  description: "Removo um membro do grupo",
  commands: ["ban", "kick"],
  usage: `${PREFIX}ban @marcar_membro\n\nou\n${PREFIX}ban (mencionando uma mensagem)`,
  handle: handleBan,
};