import fs from "node:fs/promises";
import path from "node:path";
import { DATABASE_DIR, PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import { Ffmpeg } from "../../services/ffmpeg.js";

const SAVES_DIR = path.join(DATABASE_DIR, "get");

function validateName(name) {
  if (!/^[\p{L}\p{N}_-]{1,40}$/u.test(name || "")) {
    throw new WarningError(
      `Use um nome salvo válido. Exemplo: ${PREFIX}fake-tempo video`,
    );
  }
}

export default {
  name: "fake-tempo",
  description: "Envia um vídeo completo com a duração informada alterada.",
  commands: ["fake-tempo", "tempo-fake"],
  usage: `${PREFIX}fake-tempo video +5`,

  handle: async ({ args, remoteJid, socket, webMessage, sendReply, sendSuccessReact }) => {
    const name = args?.[0] || "video";
    const seconds = Number(args?.[1] || "+1");
    validateName(name);

    if (!Number.isFinite(seconds) || seconds === 0) {
      throw new WarningError(
        `Use + para aumentar ou - para reduzir. Exemplo: ${PREFIX}fake-tempo video +5`,
      );
    }

    const videoPath = path.join(SAVES_DIR, name, "media.mp4");
    try {
      await fs.access(videoPath);
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new WarningError(
          `Não encontrei um vídeo salvo como "${name}" em database/get/${name}.`,
        );
      }
      throw error;
    }

    const ffmpeg = new Ffmpeg();

    const originalDuration = await ffmpeg.getVideoDuration(videoPath);
    const fakeDuration = originalDuration + seconds;
    if (fakeDuration <= 0) {
      throw new WarningError(
        `A duração fake não pode ser zero ou negativa. O vídeo tem ${originalDuration.toFixed(3)} segundo(s).`,
      );
    }

    const buffer = await fs.readFile(videoPath);
    const operation = seconds > 0 ? "aumentados" : "reduzidos";
    await sendReply(
      `⏳ Enviando o vídeo completo com ${Math.abs(seconds)} segundo(s) ${operation} no contador...`,
    );
    await socket.sendMessage(
      remoteJid,
      {
        video: buffer,
        caption: `🎬 𝐓𝐄𝐌𝐏𝐎 𝐅𝐀𝐊𝐄\n\nDuração exibida: ${fakeDuration.toFixed(3)} segundo(s).`,
        seconds: Math.max(1, Math.round(fakeDuration)),
      },
      { quoted: JSON.parse(JSON.stringify(webMessage)) },
    );
    await sendSuccessReact();
  },
};
