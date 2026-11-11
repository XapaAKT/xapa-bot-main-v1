import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import quoteCommand, { getQuotedAuthorName } from "../commands/member/quote.js";
import {
  clearRememberedParticipantNames,
  rememberParticipantName,
} from "../utils/participantNames.js";

test("quote resolves the quoted author's cached name, not the command sender's name", async () => {
  clearRememberedParticipantNames();
  rememberParticipantName({
    key: {
      remoteJid: "group@g.us",
      participant: "target@lid",
      participantAlt: "5511999999999@s.whatsapp.net",
    },
    pushName: "Autor da mensagem",
  }, { persist: false });

  const name = await getQuotedAuthorName({
    isGroup: true,
    remoteJid: "group@g.us",
    participantIds: ["target@lid"],
    contextInfo: {},
    getGroupMetadata: async () => ({ participants: [] }),
    socket: {},
    webMessage: { pushName: "Pessoa que usou quote" },
  });

  assert.equal(name, "Autor da mensagem");
});

test("incoming WhatsApp profile names are persisted for each LID and phone alias", () => {
  let saved;
  rememberParticipantName(
    {
      key: {
        remoteJid: "group@g.us",
        participant: "target@lid",
        participantPn: "5511999999999@s.whatsapp.net",
      },
      pushName: "Nome do perfil WhatsApp",
    },
    {
      persist: true,
      saveNames: (identifiers, name) => {
        saved = { identifiers, name };
      },
    },
  );

  assert.deepEqual(saved, {
    identifiers: ["target@lid", "5511999999999@s.whatsapp.net"],
    name: "Nome do perfil WhatsApp",
  });
});

test("quote resolves a cached name when the quoted LID is mapped to its phone JID", async () => {
  clearRememberedParticipantNames();
  rememberParticipantName({
    key: {
      remoteJid: "group@g.us",
      participant: "target@lid",
    },
    pushName: "Pessoa pelo LID",
  }, { persist: false });

  const name = await getQuotedAuthorName({
    isGroup: true,
    remoteJid: "group@g.us",
    participantIds: ["5511888888888@s.whatsapp.net"],
    contextInfo: {},
    getGroupMetadata: async () => ({ participants: [] }),
    socket: {
      signalRepository: {
        lidMapping: {
          getLIDForPN: async () => "target@lid",
        },
      },
    },
    webMessage: { pushName: "Solicitante" },
  });

  assert.equal(name, "Pessoa pelo LID");
});

test("quote falls back to the group participant name when it was not cached", async () => {
  clearRememberedParticipantNames();

  const name = await getQuotedAuthorName({
    isGroup: true,
    remoteJid: "group@g.us",
    participantIds: ["target@lid"],
    contextInfo: {},
    getGroupMetadata: async () => ({
      participants: [{ id: "target@lid", notify: "Nome nos participantes" }],
    }),
    socket: {},
    webMessage: { pushName: "Solicitante" },
  });

  assert.equal(name, "Nome nos participantes");
});

test("quote image renders the resolved author name instead of a placeholder", async () => {
  const commandMessage = {
    key: { remoteJid: "group@g.us", participant: "requester@lid" },
    pushName: "Solicitante",
    message: {
      extendedTextMessage: {
        contextInfo: {
          participant: "target@lid",
          quotedMessage: { conversation: "Mensagem citada" },
        },
      },
    },
  };
  const render = async (name) => {
    let image;
    clearRememberedParticipantNames();
    rememberParticipantName({
      key: { remoteJid: "group@g.us", participant: "target@lid" },
      pushName: name,
    }, { persist: false });
    await quoteCommand.handle({
      isGroup: true,
      isReply: true,
      remoteJid: "group@g.us",
      replyLid: "target@lid",
      webMessage: commandMessage,
      socket: {
        profilePictureUrl: async () => {
          throw Object.assign(new Error("Sem foto de perfil"), { status: 404 });
        },
      },
      getGroupMetadata: async () => ({ participants: [] }),
      sendImageFromBuffer: async (buffer) => {
        image = buffer;
      },
    });
    return image;
  };

  const namedImage = await render("Nome que aparece na quote");
  const otherNameImage = await render("Outro nome de perfil");
  assert.notDeepEqual(namedImage, otherNameImage);
  const metadata = await sharp(namedImage).metadata();
  assert.equal(metadata.width, 800);
  assert.equal(metadata.height, 450);
});

test("quote does not render a fake default name when WhatsApp has no profile name available", async () => {
  clearRememberedParticipantNames();

  await assert.rejects(
    () =>
      getQuotedAuthorName({
        isGroup: true,
        remoteJid: "group@g.us",
        participantIds: ["unknown@lid"],
        contextInfo: {},
        getGroupMetadata: async () => ({ participants: [] }),
        socket: {},
        webMessage: { pushName: "Nome de quem executou o comando" },
      }),
    /Não consegui obter o nome de perfil/,
  );
});
