import { PREFIX } from "../../../config.js";

const DISABLED_REASON =
  "A integração atual não oferece suporte a downloads do Instagram.";
export default {
  name: "instagram",
  description: "Faço o download de vídeos/reels do Instagram",
  commands: ["instagram", "ig", "inst", "insta"],
  usage: `${PREFIX}instagram https://www.instagram.com/reel/Cx789012345/`,
  disabledReason: DISABLED_REASON,
  handle: async ({ sendWarningReply }) =>
    sendWarningReply(`🚫 ${DISABLED_REASON}`),
};
