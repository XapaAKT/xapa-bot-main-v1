import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { readMore } from "../../utils/index.js";

export default {
  name: "amenu",
  description: "Menu de comandos para administradores.",
  commands: ["amenu", "menu-admin"],
  usage: `${PREFIX}amenu`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendImageFromFile, sendSuccessReact }) => {
    await sendSuccessReact();

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "xapa-adm.png"),
      `
▓▒░ 𝕏𝕀ℂ://𝔸𝔻𝕸𝕴𝕹_𝕸𝔼𝕹𝖀 ░▒▓

🔰 *ADMIN*

${readMore()}

▌abrir
▌add-auto-responder
▌agendar-mensagem
▌anti-audio
▌anti-document
▌anti-event
▌anti-image
▌anti-link
▌anti-lottier-sticker
▌anti-payment
▌anti-product
▌anti-status-grupo
▌anti-sticker
▌anti-video
▌auto-responder
▌auto-sticker
▌ban
▌block-wpp
▌def
▌delete
▌delete-auto-responder
▌exit
▌fechar
▌hide-tag
▌limpar
▌link-grupo
▌list-auto-responder
▌mute
▌only-admin
▌promover
▌rebaixar
▌revelar
▌saldo
▌set-name
▌set-proxy
▌unmute
▌unwarn
▌warn
▌warn-reactivate
▌welcome

𖤐 𝕊𝕀𝕊𝕋𝔼𝕄𝔸 𝔻𝔼 𝕄𝕆𝔻𝔼ℝ𝔸ÇÃ𝕆 𝔸𝕋𝕀𝕍𝕆
`
    );
  },
};