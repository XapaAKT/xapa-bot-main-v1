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
  description: "Envia as alterações do bot para o GitHub.",
  commands: ["update", "push", "enviar"],
  usage: `${PREFIX}update <motivo da atualização>`,

  handle: async ({ sendReply, fullArgs }) => {
    const motivo = fullArgs?.trim() || "Atualização do bot";
    
    await sendReply(`📤 Enviando alterações para o GitHub...\n\n📝 *Motivo:* ${motivo}`);

    try {
      // Stage all changes
      await execFile("git", ["add", "."], {
        cwd: BOT_DIR,
        timeout: 30000,
      });

      // Commit with the provided message
      await execFile("git", ["commit", "-m", motivo], {
        cwd: BOT_DIR,
        timeout: 30000,
      });

      // Push to GitHub
      const { stdout } = await execFile("git", ["push"], {
        cwd: BOT_DIR,
        timeout: 60000,
        maxBuffer: 1024 * 1024,
      });

      await sendReply(`✅ Alterações enviadas para o GitHub com sucesso!\n\n📝 *Commit:* ${motivo}\n\n🔗 Verifique seu repositório para confirmar.`);
    } catch (error) {
      const errorMsg = error.message || error.toString();
      
      if (errorMsg.includes("nothing to commit")) {
        await sendReply(`⚠️ Nenhuma alteração para enviar.\n\n📝 *Motivo:* ${motivo}`);
      } else if (errorMsg.includes("ENOENT") || errorMsg.includes("git")) {
        await sendReply(`❌ Git não está instalado ou configurado corretamente.\n\n⚠️ *Erro:* ${errorMsg}`);
      } else {
        await sendReply(`❌ Falha ao enviar para o GitHub.\n\n📝 *Motivo da tentativa:* ${motivo}\n\n⚠️ *Erro:* ${errorMsg}`);
      }
    }
  },
};