import { spawn, execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { PREFIX } from "../../config.js";

const execFile = promisify(execFileCallback);
const BOT_DIR = process.cwd();

function restartBot() {
  const child = spawn(process.execPath, [path.join(BOT_DIR, "src", "index.js")], {
    cwd: BOT_DIR,
    detached: true,
    stdio: "ignore",
    env: process.env,
  });

  child.unref();
}

export default {
  name: "update",
  description: "Atualiza o bot pelo GitHub e reinicia.",
  commands: ["update", "sync", "atualizar"],
  usage: `${PREFIX}update`,

  handle: async ({ sendReply }) => {
    await sendReply("🔄 Buscando atualização no GitHub...");

    try {
      const { stdout } = await execFile("git", ["pull", "--ff-only"], {
        cwd: BOT_DIR,
        timeout: 60000,
        maxBuffer: 1024 * 1024,
      });

      if (stdout.includes("Already up to date")) {
        await sendReply("✅ O bot já está atualizado. Reiniciando...");
      } else {
        await sendReply("✅ Atualização concluída. Reiniciando o bot...");
      }

      restartBot();

      setTimeout(() => process.exit(0), 1200);
    } catch (error) {
      await sendReply(`❌ Falha ao atualizar pelo GitHub.\n\n${error.message}`);
    }
  },
};