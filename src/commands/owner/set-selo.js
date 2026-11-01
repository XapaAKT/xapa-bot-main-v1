import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { setSeloType } from "../../utils/database.js";

export default {
  name: "set-selo",
  description: "Escolhe qual selo será usado no comando dono.",
  commands: ["set-selo"],
  usage: `${PREFIX}set-selo 1|2`,

  handle: async ({ args, prefix, sendSuccessReply }) => {
    if (args.length !== 1 || !["1", "2"].includes(args[0])) {
      throw new InvalidParameterError(
        `Use 1 para o selo XIC ou 2 para o selo MetaAI. Exemplo: ${prefix || PREFIX}set-selo 1`,
      );
    }

    const seloType = Number(args[0]);
    setSeloType(seloType);
    await sendSuccessReply(
      seloType === 1
        ? "Selo XIC selecionado. O comando dono usará o selo do Xapa."
        : "Selo MetaAI selecionado. O comando dono usará o SeloMeta.",
    );
  },
};
