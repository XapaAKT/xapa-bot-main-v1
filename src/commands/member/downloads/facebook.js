import { PREFIX } from "../../../config.js";

const DISABLED_REASON =
  "A integração atual não oferece suporte a downloads do Facebook.";
export default {
  name: "facebook",
  description: "Faço o download de vídeos do Facebook",
  commands: ["facebook", "face", "fb"],
  usage: `${PREFIX}facebook https://www.facebook.com/reel/123456789012345`,
  disabledReason: DISABLED_REASON,
  handle: async ({ sendWarningReply }) =>
    sendWarningReply(`🚫 ${DISABLED_REASON}`),
};
