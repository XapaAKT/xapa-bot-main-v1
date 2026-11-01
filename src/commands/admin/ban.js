import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
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

function getBanStickerFiles() {
  if (!fs.existsSync(BAN_STICKERS_DIR)) return [];

  return ["ban1.webp", "ban2.webp", "ban3.webp"]
    .map((fileName) => path.join(BAN_STICKERS_DIR, fileName))
    .filter((filePath) => fs.existsSync(filePath));
}

function getDirectStickerMessage(webMessage) {
  let message = webMessage?.message;

  for (let depth = 0; message && depth < 5; depth += 1) {
    if (message.stickerMessage) return message.stickerMessage;

    message =
      message.ephemeralMessage?.message ||
      message.viewOnceMessage?.message ||
      message.viewOnceMessageV2?.message ||
      message.documentWithCaptionMessage?.message ||
      null;
  }

  return null;
}

async function getStickerSignature(filePath) {
  return sharp(filePath)
    .resize(96, 96, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

function getSignatureDistance(left, right) {
  if (left.length !== right.length) return Number.POSITIVE_INFINITY;

  let totalDifference = 0;
  for (let index = 0; index < left.length; index += 1) {
    totalDifference += Math.abs(left[index] - right[index]);
  }

  return totalDifference / left.length;
}

export async function isOfficialBanSticker({ webMessage, downloadSticker }) {
  if (!getDirectStickerMessage(webMessage) || !downloadSticker) return false;

  try {
    const stickerPath = await downloadSticker(
      webMessage,
      `ban-command-${Date.now()}`,
    );
    if (!stickerPath) return false;

    const officialStickers = getBanStickerFiles();
    const receivedSignature = await getStickerSignature(stickerPath);

    for (const officialSticker of officialStickers) {
      const officialSignature = await getStickerSignature(officialSticker);
      if (getSignatureDistance(receivedSignature, officialSignature) <= 24) {
        return true;
      }
    }

    errorLog("[BAN STICKER] Figurinha recebida não corresponde às figurinhas oficiais.");
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