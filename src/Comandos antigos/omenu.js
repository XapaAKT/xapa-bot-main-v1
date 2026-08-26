import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";

export default {
  name: "omenu",
  description: "Menu de comandos do dono.",
  commands: ["omenu", "menu-owner", "menu-developer"],
  usage: `${PREFIX}omenu`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendImageFromFile, sendSuccessReact }) => {
    await sendSuccessReact();

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "takeshi-bot.png"),
      `
▓▒░ 𝕏𝕀ℂ://𝕺𝖂𝕹𝕰𝕽_𝕸𝕰𝕹𝖀 ░▒▓

👑 *OWNER / DEVELOPER*

▌addvip
▌get-group-id
▌off
▌on
▌set-menu-image
▌set-prefix
▌set-spider-api-token
▌teste
▌testing
▌viplist
▌xic

𖤐 𝕯𝕰𝖁𝕰𝕷𝕺𝕻𝕰𝕽 𝕻𝕬𝕹𝕰𝕷 𝕬𝕮𝕿𝕴𝖁𝕰
`
    );
  },
};