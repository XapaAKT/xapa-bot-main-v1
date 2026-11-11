import { spawn, execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { PREFIX } from "../../config.js";

const execFile = promisify(execFileCallback);
const BOT_DIR = process.cwd();
const GIT_TIMEOUT = 60000;

function runGit(args, timeout = GIT_TIMEOUT) {
  return execFile("git", args, {
    cwd: BOT_DIR,
    timeout,
    maxBuffer: 1024 * 1024,
  });
}

function getErrorMessage(error) {
  return error.stderr || error.message || error.toString();
}

async function getRemoteDefaultBranch() {
  const { stdout } = await runGit([
    "symbolic-ref",
    "--quiet",
    "--short",
    "refs/remotes/origin/HEAD",
  ]);
  const remoteHead = stdout.trim();

  if (!remoteHead.startsWith("origin/") || remoteHead.length === "origin/".length) {
    throw new Error("Não foi possível identificar a branch padrão de origin/HEAD.");
  }

  return remoteHead.slice("origin/".length);
}

function getPushArgs(targetBranch) {
  return targetBranch
    ? ["push", "origin", `HEAD:refs/heads/${targetBranch}`]
    : ["push"];
}

function getPullArgs(targetBranch) {
  return targetBranch
    ? ["pull", "--rebase", "origin", targetBranch]
    : ["pull", "--rebase"];
}

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
      const { stdout: currentBranchOutput } = await runGit([
        "branch",
        "--show-current",
      ]);
      const targetBranch = currentBranchOutput.trim()
        ? null
        : await getRemoteDefaultBranch();

      // Stage all changes
      await runGit(["add", "."], 30000);

      // Commit with the provided message
      await runGit(["commit", "-m", motivo], 30000);

      // Push to GitHub
      try {
        await runGit(getPushArgs(targetBranch));
      } catch (pushError) {
        if (!/fetch first|non-fast-forward/i.test(getErrorMessage(pushError))) {
          throw pushError;
        }

        try {
          await runGit(getPullArgs(targetBranch));
        } catch (rebaseError) {
          if (/conflict|could not apply/i.test(rebaseError.stderr || "")) {
            try {
              await runGit(["rebase", "--abort"], 30000);
            } catch (abortError) {
              throw new Error(
                `${getErrorMessage(rebaseError)}\nFalha ao cancelar o rebase: ${getErrorMessage(abortError)}`
              );
            }

            throw new Error(
              `O GitHub possui alterações conflitantes. O rebase foi cancelado para preservar o commit local.\n${getErrorMessage(rebaseError)}`
            );
          }

          throw rebaseError;
        }

        await runGit(getPushArgs(targetBranch));
      }

      await sendReply(`✅ Alterações enviadas para o GitHub com sucesso!\n\n📝 *Commit:* ${motivo}\n\n🔗 Verifique seu repositório para confirmar.`);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      
      if (errorMsg.includes("nothing to commit")) {
        await sendReply(`⚠️ Nenhuma alteração para enviar.\n\n📝 *Motivo:* ${motivo}`);
      } else if (error.code === "ENOENT") {
        await sendReply(`❌ Git não está instalado ou não está disponível no PATH.\n\n⚠️ *Erro:* ${errorMsg}`);
      } else {
        await sendReply(`❌ Falha ao enviar para o GitHub.\n\n📝 *Motivo da tentativa:* ${motivo}\n\n⚠️ *Erro:* ${errorMsg}`);
      }
    }
  },
};