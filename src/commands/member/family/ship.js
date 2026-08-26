import { extractTwoTargetJids, shipScore, shipBar } from "../../../utils/family.js";

export default {
  name: "ship",
  description: "Calcula compatibilidade entre duas pessoas.",
  commands: ["ship"],
  usage: "/ship @pessoa1 @pessoa2",

  handle: async ({
    args,
    isReply,
    replyLid,
    sendReply,
    sendText,
    sendErrorReply,
  }) => {
    const reply = sendErrorReply || sendReply;
    const [jidA, jidB] = extractTwoTargetJids({ args, isReply, replyLid });

    if (!jidA || !jidB) {
      return await reply("Use assim: /ship @pessoa1 @pessoa2");
    }

    if (jidA === jidB) {
      return await reply("Escolha duas pessoas diferentes.");
    }

    const score = shipScore(jidA, jidB);
    const bar = shipBar(score);

    const text = `╭━━━━━━━━━━━━━⛓️
│ 『 SHIP 』
│
│ 👤 A :: @${jidA.replace(/\D/g, "")}
│ 👤 B :: @${jidB.replace(/\D/g, "")}
│ ❤️ Compatibilidade :: ${score}%
│ ${bar}
╰━━━━━━━━━━━━━━━━━━`;

    if (sendText) {
      await sendText(text, [jidA, jidB]);
    } else {
      await sendReply(text);
    }
  },
};