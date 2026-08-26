import path from "node:path";
import {
  ASSETS_DIR,
  PREFIX,
  OWNER_LID,
  BOT_EMOJI,
} from "../../../config.js";
import { onlyNumbers } from "../../../utils/index.js";

export default {
  name: "suicidio",
  description: "Se suicida do grupo.",
  commands: ["suicidio", "suicidar", "suicidou"],
  usage: `${PREFIX}suicidar`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendGifFromFile,
    userLid,
    socket,
    remoteJid,
  }) => {
    const userNumber = onlyNumbers(userLid);

    let gif;
    let mensagem;

    // Mensagem exclusiva do dono
    if (userLid === OWNER_LID) {
      gif = "suicidio3.mp4";

const readMore = String.fromCharCode(8206).repeat(4001);

mensagem = `╔═════════════════════════╗
║            ☠ 𝐆 𝐀 𝐌 𝐄   𝐎 𝐕 𝐄 𝐑 ☠             ║
╚═════════════════════════╝
${readMore}

             𖤐 ✦ 🩸⛓️ 𝐗𝐚𝐩𝐚 𝐢𝐧 𝐂𝐡𝐚𝐢𝐧𝐬 ⛓️🩸 ✦ 𖤐
                     ☝︎ 𝐀𝐬 𝐚𝐛𝐨𝐯𝐞, 𝐬𝐨 𝐛𝐞𝐥𝐨𝐰 ☟

            🜏 𝐖𝐡𝐨 𝐢𝐬 𝐡𝐞𝐥𝐥 𝐥𝐢𝐤𝐞?
       「 𝐇𝐞𝐚𝐯𝐞𝐧 𝐥𝐢𝐞𝐝 — 𝐇𝐞𝐥𝐥 𝐚𝐧𝐬𝐰𝐞𝐫𝐞𝐝. 」🜏

╔═════════════════════════╗
║  ☠ 𝐋𝐈𝐅𝐄 𝐒𝐈𝐆𝐍𝐀𝐋𝐒 ............ 𝟎%             ║
║  🖤 𝐒𝐀𝐍𝐈𝐓𝐘 ................. 𝟎%                       ║
║  ⛓️ 𝐇𝐎𝐏𝐄 ................... 𝟎%                      ║
║  🕯 𝐑𝐄𝐒𝐏𝐀𝐖𝐍 ............... 𝐅𝐀𝐈𝐋              ║
╚═════════════════════════╝

          ❝ Em toda luz existe uma sombra,
            e em toda sombra permanece
               um traço de luz.

           O bem pode ocultar o veneno,
           assim como o mal pode carregar
                 a sua própria lição. ❞

═════ ✞ ═════ ✦ ═════ ✞ ═════
        𝐓𝐇𝐄 𝐄𝐍𝐃 • 𝐍𝐎 𝐒𝐄𝐂𝐎𝐍𝐃 𝐂𝐇𝐀𝐍𝐂𝐄
═════ ✞ ═════ ✦ ═════ ✞ ═════`;
    } else {
      const gifs = [
        "suicidio1.mp4",
        "suicidio2.mp4",
      ];

      gif = gifs[Math.floor(Math.random() * gifs.length)];

      mensagem = `${BOT_EMOJI} @${userNumber} se suicidou no grupo!`;
    }

    await sendGifFromFile(
      path.resolve(
        ASSETS_DIR,
        "images",
        "funny",
        gif
      ),
      mensagem,
      [userLid]
    );

    // Banir o usuário
    await socket.groupParticipantsUpdate(
      remoteJid,
      [userLid],
      "remove"
    );
  },
};