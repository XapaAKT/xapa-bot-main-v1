import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { scrapeLyrics } from "../../../services/music-lyrics.js";
import {
  removeScrapedAudio,
  scrapeMusic,
  scrapeVideo,
} from "../../../services/music-scraper.js";

function requireQuery(fullArgs) {
  if (!fullArgs?.trim()) {
    throw new InvalidParameterError(`Use ${PREFIX}play-audio nome da música.`);
  }

  return fullArgs.trim();
}

export default {
  name: "music-actions",
  description: "Ações dos botões de música.",
  commands: ["music-audio", "music-video", "music-lyrics"],
  usage: `${PREFIX}play-audio nome da música`,

  handle: async ({
    commandName,
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReact,
    sendErrorReply,
    sendAudioFromFile,
    sendVideoFromFile,
    sendReply,
  }) => {
    const query = requireQuery(fullArgs);
    let scrapedFile;

    await sendWaitReact();

    try {
      if (commandName === "musicaudio") {
        scrapedFile = await scrapeMusic(query);
        await sendAudioFromFile(scrapedFile.filePath, false);
      } else if (commandName === "musicvideo") {
        scrapedFile = await scrapeVideo(query);
        await sendVideoFromFile(scrapedFile.filePath, scrapedFile.title);
      } else {
        const result = await scrapeLyrics(query);
        await sendReply(`📝 *${result.title}*\n👤 ${result.artist}\n\n${result.lyrics}`);
      }

      await sendSuccessReact();
    } catch (error) {
      console.error("[MUSIC ACTION ERROR]", error);
      await sendErrorReact();
      await sendErrorReply(`❌ Não consegui concluir o pedido.\n\n${error.message}`);
    } finally {
      if (scrapedFile?.filePath) {
        await removeScrapedAudio(scrapedFile.filePath);
      }
    }
  },
};
