import fs from "node:fs/promises";
import path from "node:path";
import { BOT_NAME, DATABASE_DIR, PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import { Ffmpeg } from "../../services/ffmpeg.js";

const VIDEO_PATH = path.join(DATABASE_DIR, "get", "video", "media.mp4");
const RAW_PATH = path.join(DATABASE_DIR, "get", "video", "message.json");

// Altere este número para definir quantos segundos serão adicionados
// somente à duração exibida na mensagem. O vídeo não será cortado nem editado.
const EXTRA_SECONDS = 999999;

export default {
  name: "Covid",
  description: "Envia o vídeo salvo com 50 segundos adicionados no contador.",
  commands: ["Covid", "covid"],
  usage: `${PREFIX}Covid`,

  handle: async ({ remoteJid, socket, webMessage, sendReply, sendSuccessReact }) => {
    try {
      await fs.access(VIDEO_PATH);
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new WarningError(
          "O vídeo ainda não foi salvo. Salve-o usando ¡get salvar video.",
        );
      }
      throw error;
    }

    const ffmpeg = new Ffmpeg();
    const originalDuration = await ffmpeg.getVideoDuration(VIDEO_PATH);
    const fakeDuration = originalDuration + EXTRA_SECONDS;
    const video = await fs.readFile(VIDEO_PATH);
    const raw = JSON.parse(await fs.readFile(RAW_PATH, "utf8"));
    const artworkDirectPath =
      raw.message?.videoMessage?.annotations?.[0]?.embeddedContent
        ?.embeddedMusic?.artworkDirectPath || "";

    await sendReply(
      `⏳ Preparando o vídeo Covid com +${EXTRA_SECONDS} segundos no contador...`,
    );

    await socket.sendMessage(
      remoteJid,
      {
        video,
        annotations: [
          {
            polygonVertices: [
             { x: 0.17499999701976776, y: 0.3405156135559082 },
            { x: 0.824999988079071, y: 0.3405156135559082 },
            { x: 0.824999988079071, y: 0.6594765782356262 },
            { x: 0.17499999701976776, y: 0.6594765782356262 }
            ],
            shouldSkipConfirmation: true,
            embeddedContent: {
              embeddedMusic: {
                musicContentMediaId: "1594709651870049",
                songId: "1201970084729695",
                author: BOT_NAME,
                title: "Covid Time",
                artworkDirectPath,
                musicSongStartTimeInMs: 14500000000,
                isExplicit: true,
              },
            },
          },
        ],
        // Para aumentar ou reduzir o tempo, altere EXTRA_SECONDS acima.
        // Exemplo: 50 aumenta; -10 reduz 10 segundos.
        seconds: Math.round(fakeDuration),
        caption:
          `🦠 𝐂𝐎𝐕𝐈𝐃 𝐓𝐈𝐌𝐄\n\n` +
          `Duração exibida: ${fakeDuration.toFixed(3)} segundos.\n` +
          `Arquivo original enviado sem cortes.`,
      },
      { quoted: JSON.parse(JSON.stringify(webMessage)) },
    );

    await sendSuccessReact();
  },
};
