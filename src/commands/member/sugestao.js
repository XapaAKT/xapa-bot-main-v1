import fs from "node:fs";
import { PREFIX, OWNER_LID } from "../../config.js";

const SUGGESTIONS_FILE = "./database/suggestions.json";

function readSuggestions() {
  try {
    if (!fs.existsSync(SUGGESTIONS_FILE)) return [];
    const raw = fs.readFileSync(SUGGESTIONS_FILE, "utf8").trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSuggestions(list) {
  fs.writeFileSync(SUGGESTIONS_FILE, JSON.stringify(list, null, 2));
}

export default {
  name: "sugestao",
  description: "Envia uma sugestão para o dono do bot",
  commands: ["sugestao", "sug", "idea"],
  usage: `${PREFIX}sugestao <sua sugestão>`,

  handle: async ({
    fullArgs,
    sendReply,
    sendSuccessReact,
    userLid,
    remoteJid,
    socket,
    webMessage,
  }) => {
    try {
      const texto = (fullArgs || "").trim();

      if (!texto) {
        return sendReply(`
▓▒░ 𝕏𝕀ℂ://𝕊𝕌𝔾𝔼𝕊𝕋𝕆ℕ ░▒▓

✦ 𝐔𝐒𝐎:
▌${PREFIX}sugestao <sua sugestão>

✦ 𝐄𝐗𝐄𝐌𝐏𝐋𝐎:
▌${PREFIX}sugestao cria um comando de clima
`);
      }

      const suggestions = readSuggestions();

      const name =
        webMessage?.pushName ||
        webMessage?.notifyName ||
        "desconhecido";

      const number = userLid
        ? String(userLid).replace(/@lid$/, "")
        : "unknown";

      const suggestion = {
        id: Date.now().toString(),
        from: userLid || "unknown",
        name,
        number,
        group: remoteJid,
        text: texto,
        createdAt: new Date().toISOString(),
        status: "pendente",
      };

      suggestions.push(suggestion);
      saveSuggestions(suggestions);

      await sendSuccessReact();

      await sendReply(`
▓▒░ 𝕏𝕀ℂ://𝕊𝕌𝔾𝔼𝕊𝕋𝕆ℕ ░▒▓

☑ 𝐒𝐔𝐆𝐄𝐒𝐓𝐀̃𝐎 𝐄𝐍𝐕𝐈𝐀𝐃𝐀 𝐂𝐎𝐌 𝐒𝐔𝐂𝐄𝐒𝐒𝐎

𖤐 𝕆 𝕟ó 𝕣𝕖𝕔𝕖𝕓𝕖𝕦 𝕤𝕦𝕒 𝕚𝕕𝕖𝕚𝕒.
𖤐 𝕄𝕖𝕣𝕔𝕚 𝕡𝕖𝕝𝕒 𝕔𝕠𝕟𝕥𝕣𝕚𝕓𝕦𝕚çã𝕠.
`);

      if (OWNER_LID) {
        try {
          await socket.sendMessage(OWNER_LID, {
            text: `
▓▒░ 𝕏𝕀ℂ://𝕊𝕌𝔾𝔼𝕊𝕋𝕀𝕆ℕ_ℕ𝕆𝕋𝕀𝔽𝕐 ░▒▓

👤 𝕌𝕊𝕌Áℝ𝕀𝕆 :: ${name}
📱 𝕹Ú𝕸𝔼ℝ𝕆 :: ${number}
💬 𝕀𝔻𝔼𝕀𝔸 :: ${texto}
🕒 𝔻𝔸𝕋𝔸 :: ${new Date().toLocaleString("pt-BR")}
📌 𝕊𝕋𝔸𝕋𝕌𝕊 :: pendente

𖤐 𝕏𝔸ℙ𝔸 𝕀ℕ ℂℍ𝔸𝕀ℕ𝕊
            `.trim(),
          });
        } catch {
          // se falhar, a sugestão já ficou salva
        }
      }
    } catch (err) {
      console.error(err);
      await sendReply("⛓️❌ Erro ao enviar a sugestão.");
    }
  },
};