import assert from "node:assert/strict";
import test from "node:test";
import { getUlquiorraStickerMetadata } from "../services/sticker.js";

test("automatic and manual stickers share the Ulquiorra signature", () => {
  const metadata = getUlquiorraStickerMetadata({
    webMessage: { pushName: "Xapa" },
    userLid: "123456789@lid",
  });

  assert.match(metadata.username, /Cuarta Espada/);
  assert.match(metadata.username, /Rᴇsᴜʀʀᴇᴄᴄɪᴏ́ɴ: Mᴜʀᴄɪᴇ́ʟᴀɢᴏ/);
  assert.match(metadata.username, /Nada tem significado/);
  assert.equal(metadata.botName, "⤓ 🩸 Cᴇʀᴏ Osᴄᴜʀᴀs\n↳ Feita por: Xapa");
});
