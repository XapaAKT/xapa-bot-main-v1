import { PREFIX } from "../../config.js";
import { onlyNumbers } from "../../utils/index.js";

const fofocas = [
  // CRIMES
  "foi flagrado às 03:37 da manhã comendo miojo cru direto do pacote!",
  "foi pego roubando ketchup e maionese do McDonald's e guardando na mochila!",
  "foi visto tentando devolver cueca usada na loja. DISSE QUE ERA NOVA!",
  "foi pego pegando colher do restaurante e levando pra casa 'de lembrança'!",
  "foi expulso do ônibus por peidar e culpar uma senhora de 80 anos!",

  // CRINGE
  "foi pego usando meia com chinelo E bermuda tática!",
  "foi visto dançando sozinho às 4 da manhã ouvindo música do tiktok!",
  "foi flagrado colocando leite ANTES do cereal e defendendo isso!",
  "foi pego chorando no banheiro porque perdeu no UNO pra criança de 7 anos!",
  "foi visto treinando golpe de anime no espelho e gritando 'RASENGAN!'",

  // BIZARRO
  "foi pego conversando com um pombo na praça. O pombo ignorou ele!",
  "foi flagrado abraçando um poste às 2 da manhã achando que era o crush!",
  "foi visto comendo pizza com garfo e faca. Psicopata.",
  "foi pego cheirando próprio peido e dando nota de 0 a 10!",
  "foi visto mandando bom dia no grupo da família com figurinha de anime!",
  "foi pego usando filtro do instagram pra tirar foto do pé!",
  "foi flagrado dormindo na aula e roncando. Acordou falando 'professor?'",
  "foi visto pedindo música no churrasco: 'toca a do tiktok'",
];

const titulos = [
  "🗞️ *𝐅𝐎𝐅𝐎𝐂𝐀 𝐃𝐎 𝐃𝐈𝐀*",
  "🚨 *𝐔𝐑𝐆𝐄𝐍𝐓𝐄: 𝐕𝐀𝐙𝐎𝐔!*",
  "💥 *𝐄𝐗𝐂𝐋𝐔𝐒𝐈𝐕𝐎 𝐃𝐎 𝐆𝐑𝐔𝐏𝐎*",
  "📢 *𝐁𝐑𝐄𝐀𝐊𝐈𝐍𝐆 𝐍𝐄𝐖𝐒*",
  "🤡 *𝐌𝐎𝐌𝐄𝐍𝐓𝐎 𝐂𝐑𝐈𝐍𝐆𝐄*",
];

const decoracoes = [
  "▛▀▀▀▀▀▀▀▀▜\n▌ 🗞️ 𝐙𝐀𝐏 𝐅𝐎𝐅𝐎𝐂𝐀𝐒 🗞️ ▐\n▙▄▄▟",
  "╔══════════════╗\n║ 🔥 𝐅𝐎𝐅𝐎𝐐𝐔𝐈𝐍𝐇𝐀 𝐐𝐔𝐄𝐍𝐓𝐄 🔥 ║\n╚══════════════╝",
  "⚡━━━━━━━━━━━━⚡\n 💥 𝐕𝐀𝐙𝐎𝐔 𝐍𝐎 𝐆𝐑𝐔𝐏𝐎 💥\n⚡━━━━━━━━━━━━━━━━━━━━⚡",
  "🌟 ⋆｡°✩ 𝐅𝐎𝐅𝐎𝐂𝐀 𝐄𝐗𝐏𝐋𝐎𝐒𝐈𝐕𝐀 ✩°｡⋆ 🌟",
  "┏━━━━━━━━━━━━━━━━━━━┓\n┃ 📢 𝐒𝐂𝐀𝐍𝐃𝐀𝐋𝐎 𝐃𝐎 𝐀𝐍𝐎 📢 ┃\n┗━━━━━━━━━━━┛",
];

export default {
  name: "fofoca",
  description: "Espalha uma fofoca aleatória e humilha alguém do grupo.",
  commands: ["fofoca", "fofocas", "focas", "expor"],
  usage: `${PREFIX}fofoca`,

  handle: async ({
    socket,
    remoteJid,
    sendText,
    sendReact,
  }) => {

    const { participants } = await socket.groupMetadata(remoteJid);

    // Remove o próprio bot da lista
    const membros = participants.filter(
      ({ id }) =>!id.includes(":") &&!id.includes("status")
    );

    const alvo = membros[Math.floor(Math.random() * membros.length)].id;
    const numero = onlyNumbers(alvo);

    const fofoca = fofocas[Math.floor(Math.random() * fofocas.length)];
    const titulo = titulos[Math.floor(Math.random() * titulos.length)];
    const decoracao = decoracoes[Math.floor(Math.random() * decoracoes.length)];

    await sendReact("🗞️");

    await sendText(
`${decoracao}

${titulo}

🚨 @${numero} ${fofoca}

_“Fonte: Vozes da minha cabeça”_
${decoracao}`,
      [alvo]
    );
  },
};