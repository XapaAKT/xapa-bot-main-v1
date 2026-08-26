import { buyPack, formatMoney } from "../../../services/pokemonGame.js";

export default {
  name: "comprarpack",
  description: "Compra packs de Pokémon.",
  commands: ["comprarpack"],
  usage: "/comprarpack comum 1",

  handle: async ({
    fullArgs,
    sendReply,
    sendSuccessReact,
    sendErrorReply,
    userLid,
  }) => {
    const reply = sendErrorReply || sendReply;

    try {
      const [packType = "comum", amount = "1"] = String(fullArgs || "").trim().split(/\s+/);
      const result = await buyPack(userLid, packType, amount);

      if (sendSuccessReact) await sendSuccessReact();

      return await sendReply(
        `📦 Pack comprado com sucesso!\n\nTipo: ${result.packType}\nQuantidade: ${result.amount}\nTotal: ${formatMoney(result.price)}`
      );
    } catch (error) {
      return await reply(error.message || "Erro ao comprar pack.");
    }
  },
};