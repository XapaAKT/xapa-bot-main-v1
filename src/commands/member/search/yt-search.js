import { PREFIX } from "../../../config.js";
import { InvalidParameterError, WarningError } from "../../../errors/index.js";
import { search } from "../../../services/spider-x-api.js";
import { readMore, formatNumber } from "../../../utils/index.js";

export default {
  name: "yt-search",
  description: "Pesquisa vídeos no YouTube",
  commands: ["yt-search", "youtube-search", "yts"],
  usage: `${PREFIX}yt-search nirvana`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ fullArgs, sendSuccessReply }) => {
    if (!fullArgs.trim()) {
      throw new InvalidParameterError(
        `Me fala o que quer pesquisar mano\nExemplo: ${PREFIX}yt-search one piece amv`
      );
    }

    const maxLength = 100;
    if (fullArgs.length > maxLength) {
      throw new InvalidParameterError(
        `O tamanho máximo da pesquisa é de ${maxLength} caracteres.`
      );
    }

    const data = await search("youtube", fullArgs);

    if (!data || data.length === 0) {
      throw new WarningError(
        "Não foi possível encontrar resultados para a pesquisa."
      );
    }

    let text = `╭─❏ 🔍 *YOUTUBE SEARCH*\n`;
    text += `│\n`;
    text += `├ *Termo:* ${fullArgs}\n`;
    text += `├ *Resultados:* ${data.length}\n`;
    text += `│\n`;
    text += `╰───────────────❏\n\n`;

    text += `${readMore()}\n\n`; // PRA ESCONDER O RESTO KKK

    data.slice(0, 10).forEach((item, i) => {
      const views = formatNumber(item.views) || "N/A";
      text += `╭─❏ ${i + 1}\n`;
      text += `│ 🎬 *${item.title}*\n`;
      text += `│ ⏱️ *Duração:* ${item.duration}\n`;
      text += `│ 👁️ *Views:* ${views}\n`;
      text += `│ 📅 *Postado:* ${item.published_at}\n`;
      text += `│ 🔗 ${item.url}\n`;
      text += `╰────────────────❏\n\n`;
    });

    text += `> Use ${PREFIX}play-audio <nome> ou ${PREFIX}yt-mp4 <link> pra baixar`;

    await sendSuccessReply(text);
  },
};