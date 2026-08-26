/**
 * @author Xapa
 */

import path from "node:path";
import { pathToFileURL } from "node:url";

import { COMMANDS_DIR, PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import { readDirectoryRecursive } from "../../utils/index.js";

export default {
  name: "info",

  description: "Exibe as informações de um comando",

  commands: [
    "info",
    "info-cmd",
    "info-comando",
    "info-command",
  ],

  usage: `${PREFIX}info <comando>`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendReply,
    sendWaitReact,
    sendSuccessReact,
    args,
  }) => {
    const commandName = args[0]?.trim();

    if (!commandName) {
      throw new InvalidParameterError(
        "Por favor, informe o nome do comando."
      );
    }

    await sendWaitReact();

    try {
      const commandFiles = await readDirectoryRecursive(COMMANDS_DIR);

      const normalizedCommandName = commandName.toLowerCase();

      const cmdFile = commandFiles.find((file) => {
        const fileName = path
          .basename(file, path.extname(file))
          .toLowerCase();

        return (
          fileName === normalizedCommandName ||
          file.toLowerCase().includes(normalizedCommandName)
        );
      });

      if (!cmdFile) {
        throw new WarningError(
          `Comando "${commandName}" não encontrado.`
        );
      }

      /*
       * No Windows, import() não aceita diretamente caminhos absolutos
       * como:
       *
       * C:\Bots\Xapa-bot-main\src\commands\member\teste.js
       *
       * Convertemos o caminho para uma URL file:// válida.
       */
      const commandUrl = pathToFileURL(cmdFile).href;

      const cmd = await import(commandUrl);

      if (!cmd?.default) {
        throw new Error(
          "O arquivo encontrado não possui um comando exportado corretamente."
        );
      }

      const command = cmd.default;

      const info = `*Informações do comando*

- *Nome:* _${command.name || "Não informado"}_
- *Descrição:* _${command.description || "Não informado"}_
- *Comandos:* _${Array.isArray(command.commands) ? command.commands.join(", ") : "Não informado"}_
- *Uso:* _${command.usage || "Não informado"}_
`;

      await sendSuccessReact();
      await sendReply(info);
    } catch (error) {
      if (error instanceof WarningError) {
        throw error;
      }

      throw new WarningError(
        `Erro ao buscar comando, ${error.message}`
      );
    }
  },
};