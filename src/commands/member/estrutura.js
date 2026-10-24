import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { COMMANDS_DIR, PREFIX } from "../../config.js";
import { errorLog } from "../../utils/logger.js";
import { readDirectoryRecursive } from "../../utils/index.js";

const ROLE_LABELS = {
  admin: "Administradores de grupo",
  member: "Membros",
  owner: "Dono do bot",
};

const MAX_MESSAGE_LENGTH = 3500;

function getCommandMetadata(module) {
  const command = module?.default || module;
  if (!command || typeof command !== "object") return null;

  const aliases = Array.isArray(command.commands)
    ? command.commands.filter((alias) => typeof alias === "string")
    : [];

  if (!aliases.length && !command.name) return null;

  return {
    name: command.name || aliases[0],
    aliases,
    description: String(command.description || "Sem descrição cadastrada")
      .replace(/\s+/g, " ")
      .trim(),
    usage: typeof command.usage === "string" ? command.usage : "",
  };
}

async function scanCommands(prefix) {
  const commandDirectories = await fs.readdir(COMMANDS_DIR, {
    withFileTypes: true,
  });
  const files = commandDirectories
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) =>
      readDirectoryRecursive(path.join(COMMANDS_DIR, entry.name)),
    );
  const groups = new Map();
  const errors = [];
  let commandCount = 0;

  await Promise.all(
    files.map(async (filePath) => {
      const relativePath = path.relative(COMMANDS_DIR, filePath);
      const segments = relativePath.split(path.sep);
      const role = segments.length > 1 ? segments[0] : "outros";
      const category = segments.length > 2
        ? segments.slice(1, -1).join("/")
        : "geral";

      try {
        const fileStats = await fs.stat(filePath);
        const fileUrl = new URL(pathToFileURL(filePath));
        fileUrl.searchParams.set("v", String(fileStats.mtimeMs));
        const module = await import(fileUrl.href);
        const command = getCommandMetadata(module);
        if (!command) return;

        const key = `${role}/${category}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push({
          ...command,
          file: relativePath.split(path.sep).join("/"),
        });
        commandCount++;
      } catch (error) {
        errorLog(`Erro ao ler comando ${relativePath}: ${error.message}`);
        errors.push(relativePath);
      }
    }),
  );

  const roleOrder = ["member", "admin", "owner", "outros"];
  const sortedGroups = [...groups.entries()].sort(([first], [second]) => {
    const [firstRole, firstCategory] = first.split("/");
    const [secondRole, secondCategory] = second.split("/");
    const roleDifference =
      roleOrder.indexOf(firstRole) - roleOrder.indexOf(secondRole);

    return roleDifference || firstCategory.localeCompare(secondCategory);
  });

  const lines = [
    "📚 ESTRUTURA E GUIA DO BOT",
    "",
    `Prefixo reconhecido nesta conversa: ${prefix || PREFIX}`,
    `Comandos encontrados agora: ${commandCount}`,
    "",
    "COMO O BOT FUNCIONA",
    "1. src/index.js inicia o bot e src/connection.js conecta ao WhatsApp.",
    "2. src/loader.js registra os eventos recebidos.",
    "3. src/middlewares/onMesssagesUpsert.js processa cada mensagem.",
    "4. src/utils/dynamicCommand.js verifica prefixo e permissões e executa o comando.",
    "5. src/commands/ contém os comandos; src/services/ e src/utils/ concentram serviços e funções compartilhadas.",
    "6. database/ guarda configurações e dados persistentes em JSON.",
    "",
    "ORGANIZAÇÃO DOS COMANDOS",
    "A lista abaixo é reconstruída a partir dos arquivos atuais sempre que este comando é usado.",
    "member = comandos para membros; admin = administração de grupos; owner = comandos exclusivos do dono.",
    "",
  ];

  for (const [key, commands] of sortedGroups) {
    const [role, category] = key.split("/");
    const roleLabel = ROLE_LABELS[role] || "Outros comandos";
    lines.push(`📂 ${role}/${category} — ${roleLabel}`);

    commands.sort((first, second) => first.name.localeCompare(second.name));
    for (const command of commands) {
      const aliases = command.aliases.length
        ? command.aliases.map((alias) => `${prefix || PREFIX}${alias}`).join(", ")
        : `${prefix || PREFIX}${command.name}`;
      const usage = command.usage
        ? ` | Uso: ${command.usage.replaceAll(PREFIX, prefix || PREFIX)}`
        : "";

      lines.push(
        `• ${aliases} — ${command.description}${usage} [${command.file}]`,
      );
    }
    lines.push("");
  }

  if (errors.length) {
    lines.push(
      `⚠️ Não foi possível carregar ${errors.length} arquivo(s): ${errors.join(", ")}`,
    );
  }

  return { lines, commandCount };
}

function splitIntoMessages(lines) {
  const messages = [];
  let currentMessage = "";

  for (const line of lines) {
    const nextMessage = currentMessage
      ? `${currentMessage}\n${line}`
      : line;

    if (nextMessage.length > MAX_MESSAGE_LENGTH && currentMessage) {
      messages.push(currentMessage);
      currentMessage = line;
    } else {
      currentMessage = nextMessage;
    }
  }

  if (currentMessage) messages.push(currentMessage);
  return messages;
}

export default {
  name: "estrutura",
  description: "Explica como o bot funciona e lista os comandos encontrados",
  commands: ["estrutura", "sobrebot", "sobre-bot"],
  usage: `${PREFIX}estrutura`,

  handle: async ({ sendReply, prefix }) => {
    const { lines, commandCount } = await scanCommands(prefix);
    const messages = splitIntoMessages(lines);

    for (const message of messages) {
      await sendReply(message);
    }

    return commandCount;
  },
};
