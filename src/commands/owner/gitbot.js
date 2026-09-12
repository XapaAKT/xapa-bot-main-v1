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
  name: "gitbot",
  description: "Restaura o bot do GitHub (git pull) - use quando der erro.",
  commands: ["gitbot", "restore", "pull-bot", "baixar"],
  usage: `${PREFIX}gitbot`,

  handle: async ({ sendReply }) => {
    await sendReply(`⚠️ RESTAURANDO BOT DO GITHUB\n\n🔄 Baixando arquivos do repositório...\n\n*Aguarde, isso pode levar alguns segundos...*`);

    try {
      const { stdout, stderr } = await execFile("git", ["pull", "--ff-only"], {
        cwd: BOT_DIR,
        timeout: 60000,
        maxBuffer: 1024 * 1024,
      });

      if (stdout.includes("Already up to date")) {
        await sendReply(`✅ Bot já está sincronizado com o GitHub.\n\n📊 Nenhuma alteração para baixar.\n\n⏳ Reiniciando em instantes...`);
      } else {
        await sendReply(`✅ Bot restaurado com sucesso do GitHub!\n\n📥 Arquivos baixados e atualizados.\n\n⏳ Reiniciando em instantes...`);
      }

      // Restart the bot
      restartBot();

      setTimeout(() => process.exit(0), 1200);
    } catch (error) {
      const errorMsg = error.message || error.toString();
      
      if (errorMsg.includes("ENOENT") || errorMsg.includes("git")) {
        await sendReply(`❌ Git não está instalado ou configurado.\n\n⚠️ *Erro:* ${errorMsg}`);
      } else if (errorMsg.includes("conflict")) {
        await sendReply(`❌ Conflito de merge detectado.\n\n⚠️ Você tem mudanças locais que conflitam com o GitHub.\n\n💡 *Solução:* Execute manualmente: git reset --hard origin/main`);
      } else {
        await sendReply(`❌ Falha ao restaurar do GitHub.\n\n⚠️ *Erro:* ${errorMsg}`);
      }
    }
  },
};
