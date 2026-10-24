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

export default {
  name: "test-menu",
  description: "Testa o menu em carrosséis de um até sete cards",
  commands: ["test-menu", "testmenu", "teste-menu"],
  usage: `${PREFIX}test-menu`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    socket,
    remoteJid,
    prefix,
    args,
    webMessage,
    sendReply,
    sendErrorReply,
  }) => {
    const commandPrefix = prefix || PREFIX;
    const gifPath = path.join(
      ASSETS_DIR,
      "images",
      "MENU",
      "ULQUIORRA-BOT.mp4",
    );
    const buttons = getMenuButtons(commandPrefix);
    const { text: menuText, footer } = getMenuText("Você");
    const failedTestNames = [];
    let sentTests = 0;

    const cardCountTests = Array.from({ length: 7 }, (_, index) => {
      const cardCount = index + 1;
      return {
        name: `menu com ${cardCount} ${
          cardCount === 1 ? "card" : "cards"
        } (GIF + 3 botões)`,
        data: {
          text: `Menu com ${cardCount} ${
            cardCount === 1 ? "card" : "cards"
          }`,
          footer: `Teste ${cardCount}/7`,
          cards: Array.from({ length: cardCount }, (_, cardIndex) => ({
            title: `Menu ${cardIndex + 1}/${cardCount}`,
            videoPath: gifPath,
            text: `${menuText}\n\nCard ${cardIndex + 1} de ${cardCount}`,
            footer,
            buttons,
          })),
        },
      };
    });

    const allTests = [
      ...cardCountTests,
      {
        name: "Pinterest exato (2 imagens, sem botões)",
        data: {
          text: "Baseline igual ao carrossel do Pinterest",
          footer: "Pinterest",
          cards: [
            {
              imagePath: path.join(ASSETS_DIR, "images", "xapa-member.png"),
              text: "Imagem 1",
              footer: "Pinterest",
              nativeFlowButtons: [],
            },
            {
              imagePath: path.join(ASSETS_DIR, "images", "xapa-adm.png"),
              text: "Imagem 2",
              footer: "Pinterest",
              nativeFlowButtons: [],
            },
          ],
        },
      },
      {
        name: "Menu em imagens (1 botão)",
        data: {
          text: "Menu em cards de imagem",
          cards: [0, 1].map((index) => ({
            imagePath: path.join(
              ASSETS_DIR,
              "images",
              index === 0 ? "xapa-member.png" : "xapa-adm.png",
            ),
            text: menuText,
            buttons: [{ id: `${commandPrefix}menu`, text: "Abrir menu" }],
          })),
        },
      },
      {
        name: "Menu em imagens (3 botões)",
        data: {
          text: "Menu e três respostas rápidas",
          cards: [0, 1].map((index) => ({
            imagePath: path.join(
              ASSETS_DIR,
              "images",
              index === 0 ? "xapa-member.png" : "xapa-adm.png",
            ),
            text: menuText,
            buttons,
          })),
        },
      },
      {
        name: "Menu em imagens (botão de lista)",
        data: {
          text: "Menu com native-flow single_select",
          cards: [0, 1].map((index) => ({
            imagePath: path.join(
              ASSETS_DIR,
              "images",
              index === 0 ? "xapa-member.png" : "xapa-adm.png",
            ),
            text: menuText,
            nativeFlowButtons: [
              createNativeFlowButton("single_select", {
                title: "Abrir menus",
                sections: [
                  {
                    title: "Categorias",
                    rows: buttons.map(({ id, text: title }) => ({
                      id,
                      title,
                    })),
                  },
                ],
              }),
            ],
          })),
        },
      },
      {
        name: "Menu com GIFs e 1 botão",
        data: {
          text: "GIF no carrossel com botão",
          cards: [1, 2].map((number) => ({
            title: `GIF ${number}`,
            videoPath: gifPath,
            text: `${menuText}\nCard ${number}`,
            buttons: [{ id: `${commandPrefix}menu`, text: "Abrir menu" }],
          })),
        },
      },
      {
        name: "Menu sem mídia (texto e botões)",
        data: {
          text: "Carrossel somente de texto",
          cards: [1, 2].map((number) => ({
            text: `${menuText}\nCard ${number}`,
            buttons,
          })),
        },
      },
      {
        name: "Sem viewOnce",
        data: {
          text: "Mesmo carrossel, sem viewOnceMessage",
          cards: [0, 1].map((index) => ({
            imagePath: path.join(
              ASSETS_DIR,
              "images",
              index === 0 ? "xapa-member.png" : "xapa-adm.png",
            ),
            text: menuText,
            buttons,
          })),
        },
        options: { viewOnce: false },
      },
      {
        name: "Sem messageContextInfo",
        data: {
          text: "Mesmo carrossel, sem messageContextInfo",
          cards: [0, 1].map((index) => ({
            imagePath: path.join(
              ASSETS_DIR,
              "images",
              index === 0 ? "xapa-member.png" : "xapa-adm.png",
            ),
            text: menuText,
            buttons,
          })),
        },
        options: { includeMessageContextInfo: false },
      },
      {
        name: "Sem nó native_flow adicional",
        data: {
          text: "Mesmo carrossel, sem additionalNodes",
          cards: [0, 1].map((index) => ({
            imagePath: path.join(
              ASSETS_DIR,
              "images",
              index === 0 ? "xapa-member.png" : "xapa-adm.png",
            ),
            text: menuText,
            buttons,
          })),
        },
        options: { includeCarouselNodes: false },
      },
    ];
    const tests =
      (args[0] || "").toLowerCase() === "all"
        ? allTests
        : cardCountTests;

    await sendReply(
      `🧪 Vou enviar ${tests.length} testes. ` +
        (tests === allTests
          ? "Modo ALL: quantidades de cards, formato Pinterest e variações de mídia/payload."
          : "Teste o menu com 1 a 7 cards. Use /test-menu all para os testes extras."),
    );

    for (const [index, test] of tests.entries()) {
      const testNumber = index + 1;
      const cardCount = test.data.cards.length;
      await sendReply(`➡️ TESTE ${testNumber}/${tests.length}: ${test.name}`);

      try {
        await sendInteractiveCarousel(
          socket,
          remoteJid,
          { ...test.data, text: `TESTE ${testNumber}: ${test.data.text}` },
          { quoted: webMessage, ...test.options },
        );
        sentTests += 1;
      } catch (error) {
        failedTestNames.push(test.name);
        errorLog(
          `[TEST-MENU] Falha em "${test.name}": ${
            error.stack || error.message
          }`,
        );
        await sendErrorReply(
          `❌ O bot não conseguiu enviar "${test.name}": ${error.message}`,
        );
      }

      if (testNumber < tests.length) {
        await delay(1500);
      }
    }

    await sendReply(
      `🏁 Testes concluídos: ${sentTests}/${tests.length} mensagens entregues ao WhatsApp.` +
        (failedTestNames.length
          ? `\nFalhas locais: ${failedTestNames.join("; ")}.`
          : "") +
        "\nAnote quais números apareceram normalmente e quais mostraram o aviso de WhatsApp desatualizado.",
    );
  },
};
