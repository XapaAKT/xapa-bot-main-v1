import { PREFIX } from "../../config.js";
import { readMore } from "../../utils/index.js";

export default {
  name: "mmenu",
  description: "Menu de comandos para membros",
  commands: ["mmenu", "menu-membro"],
  usage: `${PREFIX}mmenu`,

  handle: async ({ socket, remoteJid }) => {
    await socket.sendMessage(remoteJid, {
      text: `╔═══════ೋღ🫧ღೋ═══════╗
      ⛓️ 𝕏𝔸ℙ𝔸 𝕀ℕ ℂℍ𝔸𝕀ℕ𝕊 ⛓️
         『 𝐌𝐄𝐌𝐁𝐄𝐑 • 𝐇𝐔𝐁 』
╚═══════ೋღ🫧ღೋ═══════╝

${readMore()}

◦•●◉✿ 𝔐𝔈𝔐𝔅𝔈ℜ ✿◉●•◦

╔═ೋ༺🎭༻ೋ═╗
┃ 🎭 DIVERSÃO E AÇÕES
╚═ೋ༺🎭༻ೋ═╝

◈ animal
◈ aura
◈ beber
◈ cancelar
◈ cpf
◈ cuspir
◈ eununca
◈ fofoca
◈ hackear
◈ ibge
◈ oraculo
◈ morte
◈ prisao
◈ processo
◈ qi
◈ estilizar
◈ abracar
◈ beijar
◈ carinho
◈ cozinhar
◈ educar
◈ jantar
◈ lutar
◈ matar
◈ roubar
◈ socar
◈ suicidio
◈ tapa
◈ tirarfoto

✦━━━━━━━━━━━━✦

╔═ೋ༺🔥༻ೋ═╗
┃ 🔥 AÇÕES 18+
╚═ೋ༺🔥༻ೋ═╝

◈ boquete
◈ dedada
◈ gozar
◈ sexo
◈ siririca
◈ suruba

✦━━━━━━━━━━━━✦

╔═ೋ༺🎮༻ೋ═╗
┃ 🎮 JOGOS
╚═ೋ༺🎮༻ೋ═╝

◈ doom
◈ ttt
◈ dinossauro
◈ truco

✦━━━━━━━━━━━━✦

╔═ೋ༺🖼️༻ೋ═╗
┃ 🖼️ EDIÇÃO DE IMAGENS
╚═ೋ༺🖼️༻ೋ═╝

◈ blur
◈ contraste
◈ espelhar
◈ gray
◈ pixel
◈ imagem

✦━━━━━━━━━━━━✦

╔═ೋ༺📥༻ೋ═╗
┃ 📥 DOWNLOADS
╚═ೋ༺📥༻ೋ═╝

◈ facebook (DESATIVADO)
◈ instagram (DESATIVADO)
◈ google (DESATIVADO)
◈ tik-tok (DESATIVADO)
◈ tik-tok-audio (DESATIVADO)
◈ pinterest
◈ play-audio (busca ou link; yt-mp3)
◈ play-video (busca ou link; yt-mp4)
◈ yt-search
◈ music-lyrics

✦━━━━━━━━━━━━✦

╔═ೋ༺🤖༻ೋ═╗
┃ 🤖 INTELIGÊNCIA ARTIFICIAL (DESATIVADA)
╚═ೋ༺🤖༻ೋ═╝

◈ deepseek (DESATIVADO)
◈ flux (DESATIVADO)
◈ gemini (DESATIVADO)
◈ gpt-5-mini (DESATIVADO)
◈ ia-sticker (DESATIVADO)

✦━━━━━━━━━━━━✦

╔═ೋ༺🛠️༻ೋ═╗
┃ 🛠️ XAPA BOT
╚═ೋ༺🛠️༻ೋ═╝

◈ catalogo (DESATIVADO)
◈ calculadora
◈ dono
◈ ddd
◈ info
◈ removebg (requer REMOVE_BG_API_KEY)
◈ rename
◈ sugestao
◈ suporte
◈ dlc
◈ nias
◈ attp
◈ brat
◈ bratvid
◈ pack
◈ sticker
◈ ttp
◈ to-gif
◈ to-image
◈ to-mp3

✦━━━━━━━━━━━━✦

╔═ೋ༺📂༻ೋ═╗
┃ 📂 MENUS ESPECÍFICOS
╚═ೋ༺📂༻ೋ═╝

◈ familia-menu
◈ economia-menu
◈ pokemon-menu
◈ rpg-menu

✦━━━━━━━━━━━━━━━━━━━━✦

┃ Use o prefixo configurado antes do comando.
┃ Para ver os menus principais, use ${PREFIX}menu.
`,
      viewOnce: true,
    });
  },
};
