import {
  BOT_EMOJI,
  BOT_NAME,
  PREFIX,
} from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { searchMusic } from "../../../services/music-scraper.js";
import { sendInteractiveCarousel } from "../../../utils/interactive.js";
import { errorLog } from "../../../utils/logger.js";

export default {
  name: "play-audio",
  description: "Baixa e envia músicas em MP3.",
  commands: ["play-audio", "play", "p", "musica"],
  usage: `${PREFIX}play nome da música`,

  handle: async ({
    fullArgs,
    socket,
    remoteJid,
    prefix,
    webMessage,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReact,
    sendErrorReply,
  }) => {
    if (!fullArgs?.trim()) {
      throw new InvalidParameterError(
        `⛧━━━━━༺𖤐༻━━━━━⛧\n┃ 🩸 Diga o nome da música que procura.\n┃\n┃ Exemplo: ${PREFIX}play Alice in Chains\n╰━━━━━━━⛓️━━━━━━━╯`,
      );
    }

    if (/https?:\/\//i.test(fullArgs)) {
      throw new InvalidParameterError(
        `⛧━━━━━༺𖤐༻━━━━━⛧\n┃ Este comando procura pelo nome da música.\n┃ Para usar um link, invoque ${PREFIX}yt-mp3 <link>.\n╰━━━━━━━⛓️━━━━━━━╯`,
      );
    }

    await sendWaitReact();

    try {
      const results = await searchMusic(fullArgs.trim());

      if (results.length === 0) {
        await sendErrorReact();
        await sendErrorReply(
          `⛧ Não encontrei essa faixa nas sombras do YouTube.\nTente outra busca com ${PREFIX}play <nome da música>.`,
        );
        return;
      }

      const activePrefix = prefix || PREFIX;
      const cards = results.map((track, index) => ({
        title: `${BOT_EMOJI} Faixa ${index + 1}/${results.length}`,
        ...(track.thumbnail && { imageUrl: track.thumbnail }),
        text: `⛧━━━━━༺𖤐༻━━━━━⛧
┃ 🎵 *${track.title}*
┃
┃ ☠ Artista: ${track.author}
┃ ⏱ Duração: ${track.duration}
╰━━━━━━━🩸━━━━━━━╯`,
        footer: BOT_NAME,
        buttons: [
          {
            id: `${activePrefix}music-audio https://youtu.be/${track.videoId}`,
            text: "Ouvir faixa",
          },
        ],
      }));

      await sendInteractiveCarousel(
        socket,
        remoteJid,
        {
          text: `⛓️ *${BOT_NAME}* ⛓️
🩸 A busca terminou. Escolha sua faixa e deixe a noite tocar.
Deslize para percorrer os resultados.`,
          footer: `✦ ${results.length} faixa(s) encontrada(s) ✦`,
          cards,
        },
        { quoted: webMessage },
      );
      await sendSuccessReact();
    } catch (error) {
      errorLog(`[PLAY-AUDIO ERROR] ${error.stack || error.message || error}`);
      await sendErrorReact();
      await sendErrorReply(
        "⛧ A busca foi interrompida antes de revelar as faixas. Tente novamente em instantes.",
      );
    }
  },
};