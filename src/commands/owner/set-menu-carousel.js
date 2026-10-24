import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { setMenuCarousel } from "../../utils/database.js";

const CAROUSEL_STATES = new Map([
  ["1", true],
  ["0", false],
  ["ativar", true],
  ["on", true],
  ["desativar", false],
  ["off", false],
]);

export default {
  name: "set-menu-carousel",
  description: "Ativa ou desativa o menu em um card, mantendo botões ou lista",
  commands: ["set-menu-carousel", "menu-carrossel", "carrossel-menu", "SMC"],
  usage: `${PREFIX}SMC 1|0`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendSuccessReply }) => {
    const enabled = CAROUSEL_STATES.get((args[0] || "").toLowerCase());
    if (enabled === undefined || args.length !== 1) {
      throw new InvalidParameterError(
        `Use 1 para ativar ou 0 para desativar. Exemplo: ${PREFIX}SMC 1`,
      );
    }

    setMenuCarousel(enabled);
    await sendSuccessReply(
      enabled
        ? "Menu em um card ativado; será exibido com os botões ou a lista definidos em SMT."
        : "Menu em carrossel desativado. O formato padrão selecionado será usado.",
    );
  },
};
