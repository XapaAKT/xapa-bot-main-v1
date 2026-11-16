import assert from "node:assert/strict";
import { describe, it } from "node:test";
import memberMenu from "../commands/member/mmenu.js";

describe("member menu", () => {
  it("keeps specialized commands in their dedicated menus", async () => {
    let text = "";
    await memberMenu.handle({
      socket: {
        sendMessage: async (_remoteJid, message) => {
          text = message.text;
        },
      },
      remoteJid: "5511999999999@s.whatsapp.net",
    });

    assert.match(text, /doom/);
    assert.match(text, /ttt/);
    assert.match(text, /dinossauro/);
    assert.match(text, /familia-menu/);
    assert.match(text, /economia-menu/);
    assert.match(text, /pokemon-menu/);
    assert.match(text, /rpg-menu/);
    assert.doesNotMatch(
      text,
      /\b(cassino|corrida|diario|saldo|trabalhar|transferir|abrirpack|casar|rpgperfil)\b/,
    );
    assert.match(text, /facebook \(DESATIVADO\)/);
    assert.match(text, /gemini \(DESATIVADO\)/);
    assert.doesNotMatch(text, /\b(ping|cep|fake-chat|meu-lid|revelar)\b/);
  });
});
