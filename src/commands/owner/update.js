import { spawn, exec as execCallback } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { PREFIX } from "../../config.js";

const exec = promisify(execCallback);

const HOME_DIR = process.env.HOME || "/data/data/com.termux/files/home";
const BOT_DIR = path.resolve(HOME_DIR, "Xapa-bot-main");
const SOURCE_DIR = "/storage/emulated/0/Download/Xapa-bot-main";

export default {
  name: "update",
  description: "Sincroniza os arquivos e reinicia o bot.",
  commands: ["update", "sync"],
  usage: `${PREFIX}update`,

  handle: async ({ sendReply }) => {
    await sendReply("🔄 Sincronizando arquivos do XIC-BOT...");

    try {
      await exec(
        `rsync -a --delete --exclude=node_modules --exclude=assets/auth "${SOURCE_DIR}/" "${BOT_DIR}/"`
      );

      await sendReply("♻️ Arquivos sincronizados. Reiniciando o bot...");

      const child = spawn("npm", ["start"], {
        cwd: BOT_DIR,
        detached: true,
        stdio: "ignore",
        env: process.env,
      });

      child.unref();

      setTimeout(() => process.exit(0), 1200);
    } catch (error) {
      await sendReply(`❌ Falha ao atualizar.\n\n${error.message}`);
    }
  },
};