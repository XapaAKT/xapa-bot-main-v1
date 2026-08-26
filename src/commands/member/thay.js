import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PREFIX } from "../../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const THAY_ID = "18039483441156";
const GIFS_DIR = path.resolve(__dirname, "../../../assets/images/personalizado");
const GIFS = ["thay1.mp4", "thay2.mp4", "thay3.mp4"];

export default {
  name: "thay",
  description: "Comando exclusivo da Thayzinha",
  commands: ["thata", "thay", "thayzinha", "vampira", "vampirinha"],
  usage: `${PREFIX}thay`,
  handle: async (props) => {
    const { remoteJid, socket, sendReply, sendVideo, sendMedia, webMessage } = props;

    const possibleIds = [
      props.senderJid, props.senderLid, props.participant, props.participantLid,
      props.userJid, props.lid, webMessage?.key?.participant,
      webMessage?.key?.participantAlt, webMessage?.key?.senderLid, webMessage?.key?.senderPn,
      webMessage?.participant,
    ].filter(Boolean).map(String);

    const isThay = possibleIds.some(id => id.includes(THAY_ID));

    if (!isThay) {
      return await sendReply("⛧ Só a vampira Thay pode usar esse comando 🖤🦇");
    }

    const randomGif = GIFS[Math.floor(Math.random() * GIFS.length)];
    const gifPath = path.join(GIFS_DIR, randomGif);

        const caption = `⛧━━━━━<⛧>━━━━━⛓️
┃ 🖤 VAMPIRINHA ON
┃ Hii, sou a Thayzinha 🦇💋
┃
> Se algo quer ir embora deixe ir,
> porque se for seu vai voltar,
> e se não for não volta 🥀
┃
┃ Segue lá meu insta, vai?
┃ 🩸 insta :: https://www.instagram.com/dark_thay0
╰━━━<⛧>━━━⛧`;
    try {
      if (sendVideo) await sendVideo(gifPath, { caption, gifPlayback: true });
      else if (sendMedia) await sendMedia(gifPath, { caption, mimetype: "video/mp4", gifPlayback: true });
      else await socket.sendMessage(remoteJid, { video: fs.readFileSync(gifPath), caption, gifPlayback: true });
    } catch (e) {
      console.error(e);
      await sendReply(caption);
    }
  },
};