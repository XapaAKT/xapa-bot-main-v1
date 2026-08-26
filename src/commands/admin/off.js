import { PREFIX, OWNER_LID } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import { deactivateGroup } from "../../utils/database.js";

export default {
  name: "off",
  description: "Desativa o bot no grupo",
  commands: ["off"],
  usage: `${PREFIX}off`,

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
        "⚠️ Este comando só pode ser usado em grupos."
      );
    }

    // Normaliza os LIDs antes da comparação
    const normalizedUserLid =
      userLid?.replace(/:[0-9]+(?=@)/, "");

    const normalizedOwnerLid =
      OWNER_LID?.replace(/:[0-9]+(?=@)/, "");

    const isOwner =
      normalizedUserLid === normalizedOwnerLid;

    // Desativa o bot no grupo
    deactivateGroup(remoteJid);

    // ============================================================
    // XAPA / DONO
    // ============================================================

    if (isOwner) {

      await sendSuccessReply(
`🏖️  ༘⋆  *FÉRIAS COLETIVAS ATIVADAS*  ⋆༘  🏖️

𓆩⛓️𓆪  Desliguei. Tô de folga oficial  𓆩⛓️𓆪
Agora a responsa caiu no colo de vocês kkk

✧  🗑️  Apagar briga
✧  ❓  Responder dúvida
✧  🔨  Banir membro chato

⏰  Volto só se o ADM mandar msg chorando p eu voltar kk😭👇

Boa sorte aí... vão precisar kkkk  𓆩✧𓆪`
      );

    // ============================================================
    // ADM
    // ============================================================

    } else {

      await sendSuccessReply(
`⛓️ *BOT DESATIVADO PELO ADM* ⛓️

O ADM nerdola bizarro achando q bota moral kkk slk tmnc.
Vou ficar off só pq quero seu paspalhão da porra kk

Se quiser que eu ligue dnv 👀👇
Use *${PREFIX}on* caraio.`
      );
    }
  },
};