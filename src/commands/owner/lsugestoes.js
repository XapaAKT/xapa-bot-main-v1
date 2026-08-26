import fs from "node:fs";
import { PREFIX } from "../../config.js";

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

function getStatusEmoji(status) {
  switch ((status || "pendente").toLowerCase()) {
    case "aprovada":
      return "✔";
    case "rejeitada":
      return "✖";
    case "desenvolvimento":
      return "🛠";
    default:
      return "⌛";
  }
}

function normalizeStatus(status) {
  const s = String(status || "pendente").toLowerCase();
  if (s === "aprovada" || s === "rejeitada" || s === "desenvolvimento") return s;
  return "pendente";
}

export default {
  name: "lsugestoes",
  description: "Lista as sugestões enviadas pelos membros",
  commands: ["lsugestoes", "list-sugestoes"],
  usage: `${PREFIX}lsugestoes`,

  handle: async ({ sendReply, sendSuccessReact }) => {
    try {
      const suggestions = readSuggestions();

      await sendSuccessReact();

      if (!suggestions.length) {
        return sendReply(`
▓▒░ 𝕏𝕀ℂ://𝕊𝕌𝔾𝔼𝕊𝕋𝕆ℕ_𝕃𝕀𝕊𝕋 ░▒▓

☠ 𝕊𝔼𝕄 𝕊𝕌𝔾𝔼𝕊𝕋𝕆𝔼𝕊 𝕊𝔸𝕃𝕍𝔸𝔻𝔸𝕊
`);
      }

      let text = `
▓▒░ 𝕏𝕀ℂ://𝕊𝕌𝔾𝔼𝕊𝕋𝕆ℕ_𝕃𝕀𝕊𝕋 ░▒▓

☣ 𝕊𝕌𝔾𝔼𝕊𝕋𝕆𝔼𝕊 𝕊𝔸𝕃𝕍𝔸𝔻𝔸𝕊 ☣

`;

      suggestions
        .slice(-20)
        .reverse()
        .forEach((sug, index) => {
          const status = normalizeStatus(sug.status);
          const emoji = getStatusEmoji(status);
          const name = sug.name || "desconhecido";
          const number = sug.number || (sug.from ? String(sug.from).replace(/@lid$/, "") : "unknown");
          const date = sug.createdAt
            ? new Date(sug.createdAt).toLocaleString("pt-BR")
            : "sem data";

          text += `
╭───────────────⛓️
│ 『 ${String(index + 1).padStart(2, "0")} 』
│ ${emoji} 𝐒𝐓𝐀𝐓𝐔𝐒 :: ${status}
│ 👤 𝐔𝐒𝐔Á𝐑𝐈𝐎 :: ${name}
│ 📱 𝐍Ú𝐌𝐄𝐑𝐎 :: ${number}
│ 📅 𝐃𝐀𝐓𝐀 :: ${date}
│
│ 💡 𝐈𝐃𝐄𝐈𝐀
│ ⤷ ${sug.text}
╰───────────────⛓️

`;
        });

      await sendReply(text.trim());
    } catch (err) {
      console.error(err);
      await sendReply("⛓️❌ Erro ao listar sugestões.");
    }
  },
};