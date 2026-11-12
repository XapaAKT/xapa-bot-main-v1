import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PREFIX, TEMP_DIR } from "../../config.js";
import { errorLog } from "../../utils/logger.js";
import { getProjectSize } from "../../utils/projectSize.js";

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const RECENT_FILE_WINDOW_MS = 15 * 60 * 1000;
const GENERATED_WEBP_FILE_PATTERN = /^xapa_\d+_\d+\.webp$/i;

async function clearOldCacheFiles(directory, cutoff) {
  let filesRemoved = 0;
  let bytesFreed = 0;

  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const result = await clearOldCacheFiles(filePath, cutoff);
      filesRemoved += result.filesRemoved;
      bytesFreed += result.bytesFreed;
      continue;
    }

    if (!entry.isFile() || entry.name === "wa-logs.txt") {
      continue;
    }

    const stats = await fs.stat(filePath);
    if (stats.mtimeMs >= cutoff) {
      continue;
    }

    await fs.unlink(filePath);
    filesRemoved++;
    bytesFreed += stats.size;
  }

  return { filesRemoved, bytesFreed };
}

export async function clearOldGeneratedWebpFiles(directory, cutoff) {
  let filesRemoved = 0;
  let bytesFreed = 0;

  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !GENERATED_WEBP_FILE_PATTERN.test(entry.name)) {
      continue;
    }

    const filePath = path.join(directory, entry.name);
    const stats = await fs.stat(filePath);
    if (stats.mtimeMs >= cutoff) {
      continue;
    }

    await fs.unlink(filePath);
    filesRemoved++;
    bytesFreed += stats.size;
  }

  return { filesRemoved, bytesFreed };
}

function formatSize(bytes, unit) {
  return `${(bytes / unit).toFixed(2)}`;
}

export default {
  name: "limpar-cache",
  description: "Limpa arquivos temporários antigos e informa o tamanho do bot.",
  commands: ["limpar-cache", "clear-cache", "cc"],
  usage: `${PREFIX}limpar-cache`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendErrorReply, sendWaitReact }) => {
    try {
      await sendWaitReact();
      await fs.mkdir(TEMP_DIR, { recursive: true });

      const cutoff = Date.now() - RECENT_FILE_WINDOW_MS;
      const { filesRemoved, bytesFreed } = await clearOldCacheFiles(
        TEMP_DIR,
        cutoff,
      );
      const generatedWebpFiles = await clearOldGeneratedWebpFiles(
        PROJECT_ROOT,
        cutoff,
      );
      const totalFilesRemoved =
        filesRemoved + generatedWebpFiles.filesRemoved;
      const totalBytesFreed = bytesFreed + generatedWebpFiles.bytesFreed;
      const projectSize = await getProjectSize(PROJECT_ROOT);

      await sendReply(
        `🧹 *Limpeza do cache concluída!*\n\n` +
          `📄 Arquivos removidos: *${totalFilesRemoved}*\n` +
          `💾 Espaço liberado: *${formatSize(totalBytesFreed, 1024)} KB* ` +
          `(*${formatSize(totalBytesFreed, 1024 ** 2)} MB* / ` +
          `*${formatSize(totalBytesFreed, 1024 ** 3)} GB*)\n\n` +
          `📦 Tamanho atual do bot: *${formatSize(projectSize, 1024)} KB* ` +
          `(*${formatSize(projectSize, 1024 ** 2)} MB* / ` +
          `*${formatSize(projectSize, 1024 ** 3)} GB*)\n\n` +
          `ℹ️ Logs, arquivos temporários e figurinhas WebP com menos de 15 minutos foram preservados.`,
      );
    } catch (error) {
      errorLog(`Erro ao limpar cache do bot: ${error.stack || error.message}`);
      await sendErrorReply(
        `Não foi possível limpar o cache do bot: ${error.message}`,
      );
    }
  },
};
