import {
  getProfileByJid,
  buildProfileText,
  familyToMentions,
} from "../../../services/family.js";

export default {
  name: "perfil",
  description: "Mostra o perfil familiar.",
  commands: ["perfil"],
  usage: "/perfil",

  handle: async ({
    userLid,
    sendReply,
    sendText,
    sendErrorReply,
  }) => {
    const reply = sendErrorReply || sendReply;

    try {
      const profile = await getProfileByJid(userLid);

      const text = buildProfileText(profile, userLid);
      const mentions = profile?.family ? familyToMentions(profile.family) : [];

      if (sendText) {
        await sendText(text, mentions);
      } else {
        await sendReply(text);
      }
    } catch (error) {
      return await reply(error.message || "Erro ao carregar perfil.");
    }
  },
};