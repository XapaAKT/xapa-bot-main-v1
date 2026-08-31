import { spawn } from "node:child_process";
import path from "node:path";
import { PREFIX } from "../../config.js";

export default {
  name: "restart",
  description: "Reinicia o bot usando node ./src/index.js.",
  commands: ["restart", "reiniciar", "reboot-bot"],
  usage: `${PREFIX}restart`,

  handle: async ({ sendReply }) => {
    await sendReply("♻️ Reiniciando o bot...");

    const child = spawn(
      process.execPath,
      [path.join(process.cwd(), "src", "index.js")],
      {
        cwd: process.cwd(),
        detached: true,
        stdio: "ignore",
        env: process.env,
      },
    );

    child.unref();
    setTimeout(() => process.exit(0), 1200);
  },
};