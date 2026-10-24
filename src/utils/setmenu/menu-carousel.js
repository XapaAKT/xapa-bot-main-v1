import path from "node:path";
import { ASSETS_DIR } from "../../config.js";
import {
  createNativeFlowButton,
  sendInteractiveCarousel,
} from "../interactive.js";

export function sendSingleMenu(
  socket,
  remoteJid,
  text,
  footer,
  buttons,
  type,
  webMessage,
) {
  const menuGifPath = path.join(
    ASSETS_DIR,
    "images",
    "MENU",
    "ULQUIORRA-BOT.mp4",
  );
  const card = {
    title: "Menu 1/1",
    videoPath: menuGifPath,
    text: `${text}\n\nCard 1 de 1`,
    footer,
  };

  if (type === "list") {
    card.nativeFlowButtons = [
      createNativeFlowButton("single_select", {
        title: "Abrir menus",
        sections: [
          {
            title: "Escolha uma categoria",
            rows: buttons.map(({ id, text: buttonText }) => ({
              title: buttonText,
              description: `Abrir ${buttonText.replace(/^[^ ]+ /, "")}`,
              id,
            })),
          },
        ],
      }),
    ];
  } else {
    card.buttons = buttons;
  }

  return sendInteractiveCarousel(
    socket,
    remoteJid,
    {
      text: "Menu com 1 card",
      footer: "Menu principal",
      cards: [card],
    },
    { quoted: webMessage },
  );
}
