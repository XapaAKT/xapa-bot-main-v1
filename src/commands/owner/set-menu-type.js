import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { setMenuType } from "../../utils/database.js";

const MENU_TYPES = new Map([
  ["1", "buttons"],
  ["2", "list"],
  ["botoes", "buttons"],
  ["buttons", "buttons"],
  ["lista", "list"],
  ["list", "list"],
]);

export default {
  name: "set-menu-type",
  description: "Altera o formato padrão do menu entre botões e lista",
  commands: ["set-menu-type", "tipo-menu", "menu-tipo", "SMT"],
  usage: `${PREFIX}SMT 1|2`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendSuccessReply }) => {
    const menuType = MENU_TYPES.get((args[0] || "").toLowerCase());
    if (!menuType || args.length !== 1) {
      throw new InvalidParameterError(
        `Escolha 1 para botões ou 2 para lista. Exemplo: ${PREFIX}SMT 2`,
      );
    }

    setMenuType(menuType);
    await sendSuccessReply(
      `Tipo padrão do menu alterado para ${menuType === "list" ? "2 (lista)" : "1 (botões)"}.`,
    );
  },
};
