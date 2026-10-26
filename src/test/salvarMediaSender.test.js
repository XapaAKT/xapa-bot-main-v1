import assert from "node:assert/strict";
import test from "node:test";
import { getMediaSenderName } from "../commands/member/noPrefix/salvar.js";

test("quoted group media uses the contact name and phone JID instead of the LID", async () => {
  const folderName = await getMediaSenderName({
    socket: {
      groupMetadata: async () => ({
        participants: [
          {
            id: "user-123@lid",
            phoneNumber: "5511999999999@s.whatsapp.net",
            notify: "Pessoa",
          },
        ],
      }),
    },
    webMessage: {
      key: {
        remoteJid: "group@g.us",
      },
      pushName: "Quem pediu para salvar",
      message: {
        extendedTextMessage: {
          contextInfo: {
            participant: "user-123@lid",
            quotedMessage: {
              imageMessage: {},
            },
          },
        },
      },
    },
  });

  assert.equal(folderName, "Pessoa - 5511999999999@s.whatsapp.net");
});

test("quoted LID resolves through the Baileys LID mapping when group metadata lacks the phone JID", async () => {
  const folderName = await getMediaSenderName({
    socket: {
      groupMetadata: async () => ({
        participants: [{ id: "user-123@lid", name: "Pessoa" }],
      }),
      signalRepository: {
        lidMapping: {
          getPNForLID: async () => "5511888888888@s.whatsapp.net",
        },
      },
    },
    webMessage: {
      key: { remoteJid: "group@g.us" },
      message: {
        extendedTextMessage: {
          contextInfo: {
            participant: "user-123@lid",
            quotedMessage: {
              videoMessage: {},
            },
          },
        },
      },
    },
  });

  assert.equal(folderName, "Pessoa - 5511888888888@s.whatsapp.net");
});

test("sender name and phone JID are used for non-quoted media", async () => {
  const folderName = await getMediaSenderName({
    socket: {},
    webMessage: {
      key: {
        remoteJid: "group@g.us",
        participant: "user-123@lid",
        participantAlt: "5511777777777@s.whatsapp.net",
      },
      pushName: "Pessoa",
    },
  });

  assert.equal(folderName, "Pessoa - 5511777777777@s.whatsapp.net");
});

test("unresolved LID is not exposed as the folder name", async () => {
  const folderName = await getMediaSenderName({
    socket: {
      groupMetadata: async () => ({ participants: [] }),
    },
    webMessage: {
      key: { remoteJid: "group@g.us" },
      message: {
        extendedTextMessage: {
          contextInfo: {
            participant: "user-123@lid",
            quotedMessage: {
              imageMessage: {},
            },
          },
        },
      },
    },
  });

  assert.equal(folderName, "Desconhecido");
});

test("quoted media never falls back to the requesting user's name", async () => {
  const folderName = await getMediaSenderName({
    socket: {
      groupMetadata: async () => ({ participants: [] }),
    },
    webMessage: {
      key: {
        remoteJid: "group@g.us",
        participant: "requester@lid",
      },
      pushName: "Quem pediu para salvar",
      message: {
        extendedTextMessage: {
          contextInfo: {
            participant: "media-author@lid",
            quotedMessage: {
              imageMessage: {},
            },
          },
        },
      },
    },
  });

  assert.equal(folderName, "Desconhecido");
  assert.notEqual(folderName, "Quem pediu para salvar");
});

test("quoted context inside an ephemeral message resolves the quoted author's name", async () => {
  const folderName = await getMediaSenderName({
    socket: {
      groupMetadata: async () => ({
        participants: [
          {
            id: "media-author@lid",
            phoneNumber: "5511666666666@s.whatsapp.net",
            notify: "Autor da mídia",
          },
        ],
      }),
    },
    webMessage: {
      key: {
        remoteJid: "group@g.us",
        participant: "requester@lid",
      },
      pushName: "Quem pediu para salvar",
      message: {
        ephemeralMessage: {
          message: {
            extendedTextMessage: {
              contextInfo: {
                participant: "media-author@lid",
                quotedMessage: {
                  imageMessage: {},
                },
              },
            },
          },
        },
      },
    },
  });

  assert.equal(folderName, "Autor da mídia - 5511666666666@s.whatsapp.net");
});
