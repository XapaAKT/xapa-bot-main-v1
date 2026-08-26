import { sendText } from "../../services/tokito.js";
import { addAutoResponderItem } from "../../utils/database.js"; // <- vem do database
import { PREFIX } from "../../../config.js"; // <- 3x pra voltar pra raiz

export default async function addAutoResponder({ from, args, isAdmin }) {
    if (!isAdmin) {
        return sendText(from, "❌ Só admin pode usar esse comando");
    }

    if (args.length < 2) {
        return sendText(from, `Uso: ${PREFIX}addauto palavra | resposta`);
    }

    const [keyword, ...responseParts] = args.join(" ").split("|");
    const response = responseParts.join("|").trim();

    if (!keyword || !response) {
        return sendText(from, `Uso: ${PREFIX}addauto palavra | resposta`);
    }

    try {
        addAutoResponderItem(keyword.trim(), response); // não precisa de await
        await sendText(from, `✅ Auto-responder adicionado:\nPalavra: ${keyword.trim()}\nResposta: ${response}`);
    } catch (err) {
        console.error("Erro add-auto-responder:", err);
        await sendText(from, "Erro ao adicionar auto-responder");
    }
}