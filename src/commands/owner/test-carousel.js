import path from "node:path";
import { delay } from "baileys";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { errorLog } from "../../utils/logger.js";
import {
  createNativeFlowButton,
  sendInteractiveCarousel,
} from "../../utils/interactive.js";
import { getMenuButtons } from "../../utils/setmenu/Botoes.js";
import { getMenuText } from "../../utils/setmenu/menu-text.js";

function createImageCard(imagePath, text, options = {}) {
  return {
    imagePath,
    text,
    ...options,
  };
}

export default {
  name: "test-carousel",
  description: "Testa variações de carrossel do WhatsApp",
  commands: ["test-carousel", "teste-carrossel", "testecarrossel"],
  usage: `${PREFIX}test-carousel`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    socket,
    remoteJid,
    prefix,
    webMessage,
    sendReply,
    sendErrorReply,
  }) => {
    const commandPrefix = prefix || PREFIX;
    const imagePaths = [
      path.join(ASSETS_DIR, "images", "xapa-member.png"),
      path.join(ASSETS_DIR, "images", "xapa-adm.png"),
      path.join(ASSETS_DIR, "images", "xapa-hub.png"),
    ];
    const menuGifPath = path.join(
      ASSETS_DIR,
      "images",
      "MENU",
      "ULQUIORRA-BOT.mp4",
    );
    const menuButtons = getMenuButtons(commandPrefix);
    const { text: menuText } = getMenuText("Você");
    const openMenuButton = {
      id: `${commandPrefix}menu`,
      text: "Abrir menu",
    };
    const quickReply = (button) =>
      createNativeFlowButton("quick_reply", {
        display_text: button.text,
        id: button.id,
      });

    const tests = [
      {
        name: "Pinterest: imagens sem botões",
        description:
          "Formato igual ao Pinterest: imagens, texto e lista native flow vazia.",
        cards: imagePaths.slice(0, 2).map((imagePath, index) =>
          createImageCard(imagePath, `Imagem ${index + 1}`, {
            footer: "Teste Pinterest",
            nativeFlowButtons: [],
          }),
        ),
      },
      {
        name: "Imagem com um botão",
        description: "Imagem nos cards com uma resposta rápida por card.",
        cards: imagePaths.slice(0, 2).map((imagePath, index) =>
          createImageCard(imagePath, `Card ${index + 1}: um botão`, {
            buttons: [openMenuButton],
          }),
        ),
      },
      {
        name: "Imagem com três botões",
        description: "Imagem nos cards com os três botões do menu.",
        cards: imagePaths.slice(0, 2).map((imagePath, index) =>
          createImageCard(imagePath, `Card ${index + 1}: três botões`, {
            buttons: menuButtons,
          }),
        ),
      },
      {
        name: "Imagem com botão de lista",
        description: "Imagem nos cards com uma lista single_select.",
        cards: imagePaths.slice(0, 2).map((imagePath) =>
          createImageCard(imagePath, "Card com botão para abrir lista", {
            nativeFlowButtons: [
              createNativeFlowButton("single_select", {
                title: "Escolha um menu",
                sections: [
                  {
                    title: "Menus",
                    rows: menuButtons.map(({ id, text: title }) => ({
                      title,
                      id,
                    })),
                  },
                ],
              }),
            ],
          }),
        ),
      },
      {
        name: "Texto do menu com botão",
        description:
          "Imagem em cada card, texto completo do menu e botão para abrir.",
        cards: imagePaths.slice(0, 2).map((imagePath) =>
          createImageCard(imagePath, `${menuText}\n\nMenu de teste.`, {
            buttons: [openMenuButton],
          }),
        ),
      },
      {
        name: "GIF, imagem, GIF",
        description: "GIF no primeiro e terceiro cards; imagem no segundo.",
        cards: [
          {
            title: "GIF - card 1",
            videoPath: menuGifPath,
            text: "GIF do menu no primeiro card.",
            nativeFlowButtons: [],
          },
          createImageCard(imagePaths[0], "Imagem no segundo card.", {
            buttons: [openMenuButton],
          }),
          {
            title: "GIF - card 3",
            videoPath: menuGifPath,
            text: "GIF do menu no terceiro card.",
            nativeFlowButtons: [],
          },
        ],
      },
      {
        name: "GIF em todos os cards",
        description: "Mesmo GIF nos três cards, sem botões.",
        cards: [1, 2, 3].map((number) => ({
          title: `GIF - card ${number}`,
          videoPath: menuGifPath,
          text: `Teste de GIF no card ${number}.`,
          nativeFlowButtons: [],
        })),
      },
    ];

    await sendReply(
      `🧪 Vou enviar ${tests.length} testes de carrossel, um por vez. ` +
        "Anote o número do teste que aparecer ou o aviso de WhatsApp desatualizado.",
    );

    let sentCount = 0;
    const failedTests = [];

    for (const [index, test] of tests.entries()) {
      const number = index + 1;
      await sendReply(
        `➡️ TESTE ${number}/${tests.length}: ${test.name}\n${test.description}`,
      );
      await delay(1000);

      try {
        await sendInteractiveCarousel(
          socket,
          remoteJid,
          {
            text: `TESTE ${number}/${tests.length}: ${test.name}`,
            footer: test.name,
            cards: test.cards,
          },
          { quoted: webMessage },
        );
        sentCount += 1;
      } catch (error) {
        failedTests.push(number);
        errorLog(
          `[TEST-CAROUSEL] Teste ${number} (${test.name}) falhou: ${
            error.stack || error.message
          }`,
        );
        await sendErrorReply(
          `❌ TESTE ${number} não foi enviado pelo bot: ${error.message}`,
        );
      }

      await delay(1500);
    }

    await sendReply(
      `🏁 Testes concluídos: ${sentCount}/${tests.length} enviados pelo bot.` +
        (failedTests.length
          ? `\nFalhas locais: ${failedTests.join(", ")}.`
          : "") +
        "\nO WhatsApp ainda pode rejeitar algum teste depois do envio; anote os números que exibirem o aviso de desatualização.",
    );
  },
};
