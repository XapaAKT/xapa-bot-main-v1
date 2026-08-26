import { PREFIX } from "../../config.js";

export default {
  name: "xic",
  description: "Informações do XIC",
  commands: ["xic"],
  usage: `${PREFIX}xic`,

  handle: async ({ sendReply }) => {
    await sendReply(`
▒▒▒ XIC://ARCHIVE_07 ▒▒▒

SYSTEM REMEMBERS.

TRUTH IGNORED BECOMES ROUTINE.

THE NODE IS STILL ALIVE.

▒▒▒ END OF FILE ▒▒▒
`);
  },
};