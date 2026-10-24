import { PREFIX, ASSETS_DIR } from "../../config.js";
import { readMore } from "../../utils/index.js";
import path from "node:path";

export default {
  name: "alugar",
  description: "Informações sobre aluguel do ULQUIORRA BOT.",
  commands: ["alugar", "rent", "host"],
  usage: `${PREFIX}alugar`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendImageFromFile,
    sendSuccessReact,
  }) => {

    await sendSuccessReact();

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "xapa-aviso.png"),
`
╔═══════════༺⛓️༻═══════════╗
                         𝐗𝐀𝐏𝐀-𝐁𝐎𝐓 • 𝐇𝐎𝐒𝐓
╚═══════════༺⛓️༻═══════════╝

⚠️ *STATUS:*
▸ Sistema de aluguel indisponível.

${readMore()}

┏━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚙️ 𝐃𝐄𝐒𝐄𝐍𝐕𝐎𝐋𝐕𝐈𝐌𝐄𝐍𝐓𝐎
┗━━━━━━━━━━━━━━━━━━━━━━┛

O *ULQUIORRA BOT* ainda está em constante desenvolvimento.

Novos comandos, sistemas e melhorias estão sendo adicionados para entregar uma experiência completa e estável.

No momento, o aluguel do bot permanece fechado até que o projeto esteja finalizado.

━━━━━━━━━━━━━━━━━━

📌 *PREVISÃO*

Ainda não existe uma data definida para a abertura dos aluguéis.

Assim que o desenvolvimento atingir um nível satisfatório, o sistema será liberado.

━━━━━━━━━━━━━━━━━━

💡 *SUGESTÕES*

Tem alguma ideia de comando ou sistema?

Envie usando:

*/sugestao sua-sugestao-aqui*

Sua sugestão pode fazer parte das próximas versões do ULQUIORRA BOT.

━━━━━━━━━━━━━━━━━━

📞 *CONTATO*

Caso tenha alguma dúvida ou queira acompanhar o desenvolvimento:

📱 *+55 31 99713-8522*
🟠 *@ez._slv*

━━━━━━━━━━━━━━━━━━

𖤐 *ULQUIORRA BOT*
*"As Above, So Below."*
`
    );
  },
};