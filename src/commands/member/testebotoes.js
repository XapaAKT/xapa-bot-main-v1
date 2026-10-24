import { PREFIX } from "../../config.js";
import { generateWAMessageFromContent, proto } from "baileys";

function buildQuickReplyInteractive({ text, footer, buttons }) {
  return proto.Message.InteractiveMessage.create({
    body: proto.Message.InteractiveMessage.Body.create({
      text,
    }),
    footer: proto.Message.InteractiveMessage.Footer.create({
      text: footer || "",
    }),
    header: proto.Message.InteractiveMessage.Header.create({
      hasMediaAttachment: false,
    }),
    nativeFlowMessage:
      proto.Message.InteractiveMessage.NativeFlowMessage.create({
        buttons,
      }),
  });
}

function buildSingleSelectInteractive({ text, footer, title, sections }) {
  return proto.Message.InteractiveMessage.create({
    body: proto.Message.InteractiveMessage.Body.create({
      text,
    }),
    footer: proto.Message.InteractiveMessage.Footer.create({
      text: footer || "",
    }),
    header: proto.Message.InteractiveMessage.Header.create({
      hasMediaAttachment: false,
    }),
    nativeFlowMessage:
      proto.Message.InteractiveMessage.NativeFlowMessage.create({
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: title || "Escolha uma opção",
              sections,
            }),
          },
        ],
      }),
  });
}

async function sendNativeInteractive({
  socket,
  remoteJid,
  webMessage,
  interactiveMessage,
}) {
  const msg = generateWAMessageFromContent(
    remoteJid,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage,
        },
      },
    },
    {
      userJid: socket.user?.id,
      quoted: webMessage,
      timestamp: new Date(),
    },
  );

  await socket.relayMessage(remoteJid, msg.message, {
    messageId: msg.key.id,
  });
}

export default {
  name: "testebtn",
  description: "Testa formatos de botão/menu no WhatsApp.",
  commands: ["testebtn", "btn-test", "testmenu"],
  usage: `${PREFIX}testebtn <1|2|3|4|5|6|7|8|9|10|11>`,

  handle: async ({
    socket,
    remoteJid,
    webMessage,
    sendReply,
    args = [],
  }) => {
    const test = String(args[0] || "1").trim();

    try {
      // =========================================================
      // TESTE 1 - BOTÕES ANTIGOS
      // =========================================================
      if (test === "1") {
        await socket.sendMessage(remoteJid, {
          text: "🩸 TESTE 1 — BOTÕES ANTIGOS\n\nSe isso aparecer clicável, o teu bot ainda aceita `buttons:`.",
          footer: "ULQUIORRA BOT",
          buttons: [
            {
              buttonId: `${PREFIX}mmenu`,
              buttonText: { displayText: "👤 Membro" },
              type: 1,
            },
            {
              buttonId: `${PREFIX}amenu`,
              buttonText: { displayText: "🛡 Admin" },
              type: 1,
            },
            {
              buttonId: `${PREFIX}omenu`,
              buttonText: { displayText: "👑 Dono" },
              type: 1,
            },
          ],
          headerType: 1,
        });

        return sendReply("Teste 1 enviado.");
      }

      // =========================================================
      // TESTE 2 - LISTA
      // =========================================================
      if (test === "2") {
        await socket.sendMessage(remoteJid, {
          text: "⛓️ TESTE 2 — LISTA\n\nSe isso abrir uma lista, o menu por lista funciona.",
          footer: "ULQUIORRA BOT",
          title: "MENU TESTE",
          buttonText: "ABRIR MENU",
          sections: [
            {
              title: "Categorias",
              rows: [
                {
                  title: "👤 Membro",
                  rowId: `${PREFIX}mmenu`,
                  description: "Abre o menu de membro",
                },
                {
                  title: "🛡 Admin",
                  rowId: `${PREFIX}amenu`,
                  description: "Abre o menu de admin",
                },
                {
                  title: "👑 Dono",
                  rowId: `${PREFIX}omenu`,
                  description: "Abre o menu do dono",
                },
              ],
            },
          ],
        });

        return sendReply("Teste 2 enviado.");
      }

      // =========================================================
      // TESTE 3 - NATIVE FLOW / QUICK REPLY
      // =========================================================
      if (test === "3") {
        const interactiveMessage = buildQuickReplyInteractive({
          text: "☠ TESTE 3 — NATIVE FLOW / QUICK REPLY\n\nSe isso aparecer, o novo sistema está vivo.",
          footer: "ULQUIORRA BOT",
          buttons: [
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "👤 Membro",
                id: `${PREFIX}mmenu`,
              }),
            },
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "🛡 Admin",
                id: `${PREFIX}amenu`,
              }),
            },
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "👑 Dono",
                id: `${PREFIX}omenu`,
              }),
            },
          ],
        });

        await sendNativeInteractive({
          socket,
          remoteJid,
          webMessage,
          interactiveMessage,
        });

        return sendReply("Teste 3 enviado.");
      }

      // =========================================================
      // TESTE 4 - NATIVE FLOW / SINGLE SELECT
      // =========================================================
      if (test === "4") {
        const interactiveMessage = buildSingleSelectInteractive({
          text: "🩸 TESTE 4 — SINGLE SELECT\n\nSe isso abrir uma lista dentro do botão, é sinal de Native Flow funcionando.",
          footer: "ULQUIORRA BOT",
          title: "Escolha uma opção",
          sections: [
            {
              title: "Menus",
              rows: [
                {
                  id: `${PREFIX}mmenu`,
                  title: "👤 Membro",
                  description: "Menu de membro",
                },
                {
                  id: `${PREFIX}amenu`,
                  title: "🛡 Admin",
                  description: "Menu de admin",
                },
                {
                  id: `${PREFIX}omenu`,
                  title: "👑 Dono",
                  description: "Menu do dono",
                },
              ],
            },
          ],
        });

        await sendNativeInteractive({
          socket,
          remoteJid,
          webMessage,
          interactiveMessage,
        });

        return sendReply("Teste 4 enviado.");
      }

      // =========================================================
      // TESTE 5 - BOTÃO SIMPLES COM sendMessage
      // =========================================================
      if (test === "5") {
        await socket.sendMessage(remoteJid, {
          text: "🧪 TESTE 5\n\nBotão abaixo:",
          buttons: [
            {
              buttonId: "teste_1",
              buttonText: {
                displayText: "🩸 TESTAR",
              },
              type: 1,
            },
          ],
          headerType: 1,
        });

        return sendReply("Teste 5 enviado.");
      }

      // =========================================================
      // TESTE 6 - DOIS BOTÕES
      // =========================================================
      if (test === "6") {
        await socket.sendMessage(remoteJid, {
          text: "🧪 TESTE 6\n\nEscolha uma opção:",
          buttons: [
            {
              buttonId: "opcao_a",
              buttonText: {
                displayText: "⛓️ OPÇÃO A",
              },
              type: 1,
            },
            {
              buttonId: "opcao_b",
              buttonText: {
                displayText: "☠️ OPÇÃO B",
              },
              type: 1,
            },
          ],
          headerType: 1,
        });

        return sendReply("Teste 6 enviado.");
      }

      // =========================================================
      // TESTE 7 - BOTÃO COM QUOTED
      // =========================================================
      if (test === "7") {
        await socket.sendMessage(
          remoteJid,
          {
            text: "🧪 TESTE 7\n\nBotão com mensagem citada:",
            buttons: [
              {
                buttonId: "teste_quoted",
                buttonText: {
                  displayText: "🩸 CLIQUE",
                },
                type: 1,
              },
            ],
            headerType: 1,
          },
          {
            quoted: webMessage,
          },
        );

        return sendReply("Teste 7 enviado.");
      }

      // =========================================================
      // TESTE 8 - INFORMAÇÕES DO AMBIENTE
      // =========================================================
      if (test === "8") {
        return sendReply(
          `🧪 TESTE 8\n\n` +
            `Node: ${process.version}\n` +
            `Platform: ${process.platform}\n` +
            `Arch: ${process.arch}\n` +
            `Baileys socket.user: ${socket.user?.id || "unknown"}\n` +
            `remoteJid: ${remoteJid}`,
        );
      }

      // =========================================================
      // TESTE 9 - TIPOS DAS FUNÇÕES
      // =========================================================
      if (test === "9") {
        return sendReply(
          `🧪 TESTE 9\n\n` +
            `generateWAMessageFromContent: ${typeof generateWAMessageFromContent}\n` +
            `proto: ${typeof proto}\n` +
            `socket.sendMessage: ${typeof socket.sendMessage}\n` +
            `socket.relayMessage: ${typeof socket.relayMessage}`,
        );
      }

      // =========================================================
      // TESTE 10 - INSPEÇÃO DO webMessage
      // =========================================================
      if (test === "10") {
        const info = {
          messageTimestamp: webMessage?.messageTimestamp,
          key: {
            id: webMessage?.key?.id,
            remoteJid: webMessage?.key?.remoteJid,
            participant: webMessage?.key?.participant,
          },
          hasMessage: Boolean(webMessage?.message),
          messageKeys: webMessage?.message
            ? Object.keys(webMessage.message)
            : [],
        };

        console.log("[TESTE 10] WEB MESSAGE:", JSON.stringify(info, null, 2));

        return sendReply(
          `🧪 TESTE 10\n\n${JSON.stringify(info, null, 2)}`,
        );
      }

      // =========================================================
      // TESTE 11 - NATIVE FLOW MÍNIMO
      // =========================================================
      if (test === "11") {
        const interactiveMessage = buildQuickReplyInteractive({
          text: "🧪 TESTE 11\n\nMensagem interativa mínima.",
          footer: "ULQUIORRA BOT",
          buttons: [
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "OK",
                id: "ok_test",
              }),
            },
          ],
        });

        await sendNativeInteractive({
          socket,
          remoteJid,
          webMessage,
          interactiveMessage,
        });

        return sendReply("Teste 11 enviado.");
      }

      return sendReply(
        "Use:\n\n" +
          `${PREFIX}testebtn 1\n` +
          `${PREFIX}testebtn 2\n` +
          `${PREFIX}testebtn 3\n` +
          `${PREFIX}testebtn 4\n` +
          `${PREFIX}testebtn 5\n` +
          `${PREFIX}testebtn 6\n` +
          `${PREFIX}testebtn 7\n` +
          `${PREFIX}testebtn 8\n` +
          `${PREFIX}testebtn 9\n` +
          `${PREFIX}testebtn 10\n` +
          `${PREFIX}testebtn 11`,
      );
    } catch (error) {
      console.error("[TESTEBTN ERROR]", error);
      return sendReply(`❌ Erro no teste: ${error.message}`);
    }
  },
};