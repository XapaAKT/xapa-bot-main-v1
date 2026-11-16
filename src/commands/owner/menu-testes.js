import { PREFIX } from "../../config.js";

export default {
  name: "menu-testes",
  description: "Lista comandos usados para testes do bot.",
  commands: ["menu-testes", "testes-menu"],
  usage: `${PREFIX}menu-testes`,

  handle: async ({ sendReply, prefix = PREFIX }) => {
    await sendReply(
      `🧪 *MENU DE TESTES*\n\n` +
        `◈ ${prefix}tb [opção] — testa botões e listas\n` +
        `◈ ${prefix}test-carousel — testa carrosséis\n` +
        `◈ ${prefix}test-menu [all] — testa formatos de menu\n` +
        `◈ ${prefix}testing — imprime informações de conexão no terminal\n` +
        `◈ ${prefix}teste — imprime a mensagem recebida no terminal\n` +
        `◈ ${prefix}teste-ligacao <ativar|desativar> — testa a configuração da Cloud API\n` +
        `◈ ${prefix}metaai — teste administrativo de participação em grupo`,
    );
  },
};
