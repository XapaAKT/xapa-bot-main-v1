import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import {
  getYoutubeVideoId,
  removeScrapedFile,
  scrapeVideo,
} from "../../../services/music-scraper.js";
import { errorLog } from "../../../utils/logger.js";

export default {
  name: "play-video",
  description: "Pesquisa ou baixa vídeos do YouTube em MP4.",
  commands: [
    "play-video",
    "pv",
    "yt-mp4",
    "youtube-mp4",
    "yt-video",
    "youtube-video",
    "mp4",
  ],
  usage: `${PREFIX}play-video <pesquisa ou link do YouTube>`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendVideoFromFile,
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReact,
    sendErrorReply,
  }) => {
    const query = fullArgs?.trim();
    if (!query) {
      throw new InvalidParameterError(
        `Use ${PREFIX}play-video <pesquisa ou link do YouTube>.`,
      );
    }

    if (/^https?:\/\//i.test(query) && !getYoutubeVideoId(query)) {
      throw new InvalidParameterError(
        "Envie um link válido do YouTube ou pesquise pelo nome do vídeo.",
      );
    }

    await sendWaitReact();
    let scrapedFile;
    try {
      scrapedFile = await scrapeVideo(query);
      await sendVideoFromFile(
        scrapedFile.filePath,
        `🎬 *${scrapedFile.title}*\n` +
          `👤 Canal: ${scrapedFile.author}\n` +
          `⏱️ Duração: ${scrapedFile.duration}\n` +
          `🔗 ${scrapedFile.url}`,
      );
      await sendSuccessReact();
    } catch (error) {
      errorLog(`[PLAY-VIDEO ERROR] ${error.stack || error.message || error}`);
      await sendErrorReact();
      await sendErrorReply(`Não consegui baixar o vídeo: ${error.message}`);
    } finally {
      if (scrapedFile?.filePath) {
        await removeScrapedFile(scrapedFile.filePath);
      }
    }
  },
};
