import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { setYoutubeSearchCarousel } from "../../utils/database.js";

export default {
  name: "yts-type",
  description: "Ativa ou desativa o carrossel nos resultados do YouTube Search.",
  commands: ["yts-type", "ytst"],
  usage: `${PREFIX}yts-type 1|0`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, prefix, sendSuccessReply }) => {
    if (args.length !== 1 || !["0", "1"].includes(args[0])) {
      throw new InvalidParameterError(
        `Use 1 para ativar ou 0 para desativar o carrossel. Exemplo: ${prefix || PREFIX}yts-type 1`,
      );
    }

    const enabled = args[0] === "1";
    setYoutubeSearchCarousel(enabled);
    await sendSuccessReply(
      enabled
        ? "Carrossel do YouTube Search ativado. As próximas buscas serão exibidas em cards."
        : "Carrossel do YouTube Search desativado. As próximas buscas serão exibidas em texto.",
    );
  },
};
