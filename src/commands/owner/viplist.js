import fs from "fs";
import { PREFIX } from "../../config.js";

const VIP_FILE = "./assets/vip.json";

export default {
  name: "viplist",
  description: "Lista todos os usuários VIP.",
  commands: ["viplist"],
  usage: `${PREFIX}viplist`,

  handle: async ({ sendReply }) => {
    try {
      if (!fs.existsSync(VIP_FILE)) {
        return sendReply("☠ 𝕍𝕀ℙ 𝔻𝔸𝕋𝔸𝔹𝔸𝕊𝔼 ℕ𝕆𝕋 𝔽𝕆𝕌ℕ𝔻");
      }

      const vip = JSON.parse(fs.readFileSync(VIP_FILE));

      if (!vip.length) {
        return sendReply(`

▓▒░ 𝕏𝕀ℂ://𝕍𝕀𝕻_𝕃𝕀𝕊𝕋 ░▒▓

☠ 𝕹𝕺 𝕬𝕮𝕿𝕴𝖁𝕰 𝖁𝕴𝕻 𝕹𝕺𝕯𝕰𝕾

`);
      }

      let texto = `
▓▒░ 𝕏𝕀ℂ://𝕍𝕀𝕻_𝕃𝕀𝕊𝕋 ░▒▓

☣ 𝔸ℂ𝕋𝕀𝕍𝔼 𝕍𝕀ℙ ℕ𝕆𝔻𝔼𝕊 ☣

`;

      vip.forEach((user, i) => {
        texto += `
[${i + 1}]
▌𝕌𝕊𝔼ℝ :: ${user.id.split("@")[0]}
▌𝕊𝕋𝔸𝕋𝕌𝕊 :: ${user.infinito ? "𝕍𝕀𝕻_∞" : "𝕍𝕀𝕻"}
▌𝔻𝔸𝕐𝕊 :: ${user.infinito ? "∞" : user.dias}

`;
      });

      texto += `
𖤐 𝕋ℍ𝔼 ℕ𝕆𝔻𝔼 ℝ𝔼𝕄𝔼𝕄𝔹𝔼ℝ𝕊

⛓ 𝕏𝔸ℙ𝔸 𝕀ℕ ℂℍ𝔸𝕀ℕ𝕊
`;

      await sendReply(texto);

    } catch (err) {
      console.error(err);

      await sendReply(`

☠ 𝕏𝕀ℂ://𝔼ℝℝ𝕆ℝ

𝔽𝔸𝕀𝕃𝔼𝔻 𝕋𝕆 ℝ𝔼𝔸𝔻 𝕍𝕀ℙ 𝔻𝔸𝕋𝔸

`);
    }
  },
};