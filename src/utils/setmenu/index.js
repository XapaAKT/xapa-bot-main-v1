import path from "node:path";
import { ASSETS_DIR } from "../../config.js";
import { getMenuSettings } from "../database.js";
import {
  createNativeFlowButton,
  sendNativeFlowButtons,
} from "../interactive.js";
import { getMenuButtons } from "./Botoes.js";
import { sendButtonMenu } from "./menu-botao.js";
import { sendSingleMenu } from "./menu-carousel.js";
import { getMenuText } from "./menu-text.js";

export async function executeMenu({
  socket,
  remoteJid,
  prefix,
  userName,
  webMessage,
}) {
  const { text, footer } = getMenuText(userName);
  const buttons = getMenuButtons(prefix);
  const { type, carousel } = getMenuSettings();

  try {
    if (carousel) {
      await sendSingleMenu(
        socket,
        remoteJid,
        text,
        footer,
        buttons,
        type,
        webMessage,
      );
    } else if (type === "list") {
      await sendNativeFlowButtons(socket, remoteJid, {
        videoPath: path.join(
          ASSETS_DIR,
          "images",
          "MENU",
          "ULQUIORRA-BOT.mp4",
        ),
        title: "Menu principal",
        text,
        footer,
        buttons: [
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
        ],
      });
    } else {
      await sendButtonMenu(socket, remoteJid, text, footer, buttons);
    }
  } catch (error) {
    console.error("[MENU ERROR]", error);
    await socket.sendMessage(
      remoteJid,
      {
        text: `${text}\n\n${footer}\n\nDigite:\n${buttons
          .map(
            ({ id, text: buttonText }, index) =>
              `${index + 1} - ${buttonText}: ${id}`,
          )
          .join("\n")}`,
      },
      { quoted: webMessage },
    );
  }
}
