import {
  BOT_EMOJI,
  BOT_NAME,
  PREFIX,
} from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import {
  getYoutubeVideoId,
  removeScrapedFile,
  scrapeMusic,
  searchMusic,
} from "../../../services/music-scraper.js";
import { sendInteractiveCarousel } from "../../../utils/interactive.js";
import { errorLog } from "../../../utils/logger.js";

export default {
  name: "play-audio",
  description: "Pesquisa ou baixa músicas do YouTube em MP3.",
  commands: ["play-audio", "play", "p", "musica", "yt-mp3", "ytmp3"],
  usage: `${PREFIX}play-audio <nome ou link do YouTube> [--link]`,

  handle: async ({
    commandName,
    fullArgs,
    socket,
    remoteJid,
    prefix,
    webMessage,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReact,
    sendErrorReply,
    sendAudioFromFile,
    sendReply,
  }) => {
    const legacyLinkCommand = ["yt-mp3", "ytmp3"].includes(
      (commandName || "").toLowerCase(),
    );
    const includeLink =
      legacyLinkCommand || /(?:^|\s)--link(?=\s|$)/i.test(fullArgs || "");
    const query = (fullArgs || "")
      .replace(/(?:^|\s)--link(?=\s|$)/i, " ")
      .trim();

    if (!query) {
      throw new InvalidParameterError(
        `Use ${PREFIX}play-audio <nome ou link do YouTube> [--link].`,
      );
    }

    if (/^https?:\/\//i.test(query) && !getYoutubeVideoId(query)) {
      throw new InvalidParameterError(
        "Envie um link válido do YouTube ou pesquise pelo nome da música.",
      );
    }

    await sendWaitReact();

    let scrapedFile;
    try {
      if (getYoutubeVideoId(query)) {
        scrapedFile = await scrapeMusic(query);
        await sendAudioFromFile(scrapedFile.filePath, false);
        if (includeLink) {
          await sendReply(`🔗 Link da música: ${scrapedFile.url}`);
        }
        await sendSuccessReact();
        return;
      }

      const results = await searchMusic(query);

      if (results.length === 0) {
        await sendErrorReact();
        await sendErrorReply(
          `Não encontrei essa faixa. Tente outra busca com ${PREFIX}play-audio <nome da música>.`,
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
            id:
              `${activePrefix}music-audio https://youtu.be/${track.videoId}` +
              (includeLink ? " --link" : ""),
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
        `Não consegui baixar o áudio: ${error.message}`,
      );
    } finally {
      if (scrapedFile?.filePath) {
        await removeScrapedFile(scrapedFile.filePath);
      }
    }
  },
};