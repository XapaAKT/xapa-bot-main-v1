import { PREFIX } from "../../../config.js";

const DISABLED_REASON =
  "A integração atual não oferece suporte a downloads de áudio do TikTok.";
export default {
  name: "tik-tok-audio",
  description: "Faço o download de áudios de vídeos do TikTok",
  commands: [
    "tik-tok-audio",
    "tik-tok-mp3",
    "tik-audio",
    "tik-mp3",
    "ttk-audio",
    "ttk-mp3",
  ],
  usage: `${PREFIX}tik-tok-audio https://www.tiktok.com/@topicoquiz/video/7384803418855984389`,
  disabledReason: DISABLED_REASON,
  handle: async ({ sendWarningReply }) =>
    sendWarningReply(`🚫 ${DISABLED_REASON}`),
};
