import { chooseProfession } from "../../../services/rpgGame.js";
import { getUserName } from "../../../utils/index.js";

export default {
  name: "rpgprofissao",
  description: "Escolhe uma profissão para seu personagem.",
  commands: ["rpgprofissao", "profissao"],
  usage: "/profissao ferreiro|alquimista|coletor|mercador",
  requiresRpg: true,
  handle: async ({ args, userLid, sendReply, webMessage }) => {
    const profession = await chooseProfession(userLid, args?.[0], getUserName(webMessage, userLid, "Aventureiro"));
    return sendReply(`✅ Você se tornou ${profession.emoji} **${profession.name}**!\n${profession.bonus}`);
  },
};
