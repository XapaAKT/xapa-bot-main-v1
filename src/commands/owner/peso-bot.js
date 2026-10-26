import path from "node:path";
import { fileURLToPath } from "node:url";
import { PREFIX } from "../../config.js";
import { errorLog } from "../../utils/logger.js";
import { getProjectSize } from "../../utils/projectSize.js";

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

function formatSize(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

export default {
  name: "peso-bot",
  description: "Consulta o tamanho dos arquivos do bot sem apagar nada.",
  commands: ["peso-bot", "tamanho-bot", "pesobot"],
  usage: `${PREFIX}peso-bot`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendErrorReply, sendWaitReact }) => {
    try {
      await sendWaitReact();
      const totalBytes = await getProjectSize(PROJECT_ROOT);

      await sendReply(
        `📦 *Tamanho do bot:* ${formatSize(totalBytes)}\n` +
          `💾 Total exato: ${totalBytes.toLocaleString("pt-BR")} bytes\n\n` +
          "ℹ️ A medição inclui dependências, mídias, arquivos de sessão e dados locais. A pasta `.git` não é contabilizada.\n" +
          "✅ Este comando é apenas de consulta: não apaga nem altera arquivos.",
      );
    } catch (error) {
      errorLog(`Erro ao consultar o tamanho do bot: ${error.stack || error.message}`);
      await sendErrorReply(
        `Não foi possível consultar o tamanho do bot: ${error.message}`,
      );
    }
  },
};
