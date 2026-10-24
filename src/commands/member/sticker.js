/**
 * Desenvolvido por: Xapa
 * Estilo: ULQUIORRA CIFER - Cuarta Espada
 * @author Xapa
 */
import { BOT_NAME, PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { createSticker } from "../../services/sticker.js";
import { getUserName } from "../../utils/index.js";

const BOT_PACK = "꧁༺𖤐⃟𝆺𝅥⃝🩸𝙐𝙇𝙌𝙐𝙄𝙊𝙍𝙍𝘼-𝘽𝙊𝙏🩸⃝𝆺𝅥⃟𖤐༻꧂";
const OWNER_NICK = "༺🌹⃟𝐗𝐀𝐏𝐀𝅯🫠༺";

const PACK_NAME = `🌑 Cuarta Espada
↳ ${BOT_PACK}

⤓ 🦇 Rᴇsᴜʀʀᴇᴄᴄɪᴏ́ɴ: Mᴜʀᴄɪᴇ́ʟᴀɢᴏ
↳ "Nada tem significado" • ⤓ 🖤 ${OWNER_NICK} `;

export default {
  name: "sticker",
  description: "Cria figurinhas de imagem, gif ou vídeo (máximo 10 segundos).",
  commands: ["f", "s", "sticker", "fig"],
  usage: `${PREFIX}sticker (marque ou responda uma imagem/gif/vídeo)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async (paramsHandler) => {
    const { isImage, isVideo, sendWaitReact, sendSuccessReact } = paramsHandler;

    if (!isImage && !isVideo) {
      throw new InvalidParameterError(
        `Você precisa marcar ou responder a uma imagem/gif/vídeo!`
      );
    }

    await sendWaitReact();
    const requesterName = getUserName(
      paramsHandler.webMessage,
      paramsHandler.userLid,
    );

    await createSticker(paramsHandler, {
      username: PACK_NAME,
      botName: `⤓ 🩸 Cᴇʀᴏ Osᴄᴜʀᴀs\n↳ Feita por: ${requesterName}`,
    });

    await sendSuccessReact();
  },
};