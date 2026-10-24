import path from "node:path";
import { ASSETS_DIR } from "../../config.js";
import { sendInteractiveGifButtons } from "../interactive.js";

export function sendButtonMenu(socket, remoteJid, text, footer, buttons) {
  return sendInteractiveGifButtons(socket, remoteJid, {
    videoPath: path.join(ASSETS_DIR, "images", "MENU", "ULQUIORRA-BOT.mp4"),
    text,
    footer,
    buttons,
  });
}
