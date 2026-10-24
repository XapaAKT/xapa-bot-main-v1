import { PREFIX } from "../../config.js";
import { getUserName } from "../../utils/index.js";
import { executeMenu } from "../../utils/setmenu/index.js";

export default {
  name: "menu",
  description: "Menu principal do ULQUIORRA BOT",
  commands: ["menu", "ULQUIORRA"],
  usage: `${PREFIX}menu`,
  
  handle: async ({ socket, remoteJid, prefix, webMessage, userLid, m }) => {
    await executeMenu({
      socket,
      remoteJid,
      prefix,
      userName: getUserName(webMessage || m, userLid, "usuário"),
      webMessage: webMessage || m,
    });
  },
};