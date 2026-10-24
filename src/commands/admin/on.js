import { PREFIX, OWNER_LID } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import { activateGroup } from "../../utils/database.js";

export default {
  name: "on",
  description: "Ativa o bot no grupo",
  commands: ["on"],
  usage: `${PREFIX}on`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendSuccessReply,
    remoteJid,
    isGroup,
    userLid,
  }) => {
    if (!isGroup) {
      throw new WarningError(
        "⚠️ Esse comando só pode ser usado dentro de um grupo."
      );
    }

    // Verifica se é o DONO DO BOT
    const isOwner = userLid === OWNER_LID;

    // ATIVA O BOT
    activateGroup(remoteJid);

    // ============================================================
    // DONO DO BOT
    // ============================================================
    if (isOwner) {
      await sendSuccessReply(
`⛧━━━━━༺𖤐༻━━━━━⛓️━━━━━༺𖤐༻━━━━━⛧
┃
┃  🩸 *ULQUIORRA BOT ESTÁ DE VOLTA*
┃
┃  O próprio Xapa resolveu
┃  sair da aposentadoria. 💀
┃
┃  ⛓️ *STATUS :: ONLINE*
┃
┃  A desgraça foi reativada
┃  oficialmente pelo dono.
┃
┃  Agora podem voltar a pedir
┃  comando, ajuda e coisa inútil. 🗿
┃
⛧━━━━━༺𖤐༻━━━━━⛓️━━━━━༺𖤐༻━━━━━⛧`
      );

      return;
    }

    // ============================================================
    // ADM
    // ============================================================
    await sendSuccessReply(
`⛧━━━━━༺𖤐༻━━━━━⛓️━━━━━༺𖤐༻━━━━━⛧
┃
┃  🤡 *COMUNICADO OFICIAL* 🤡
┃
┃  O ADM não aguentou 5 min
┃  sem o ULQUIORRA BOT e veio chorar
┃  no meu PV.
┃
┃  "mano volta com o bot pfv,
┃   o grupo morreu sem ele" 😭🙏
┃
┃  Chegou até a prometer que vai
┃  parar de mandar bom dia com
┃  florzinha.
┃
┃  Como eu tenho pena de gente
┃  carente...
┃
┃  ⛓️ *BOT RELIGADO NA MARRA* ⛓️
┃
┃  Podem voltar a usar.
┃  E ADM, da próxima vez chora
┃  com áudio que é mais engraçado.
┃
⛧━━━━━༺𖤐༻━━━━━⛓️━━━━━༺𖤐༻━━━━━⛧`
    );
  },
};