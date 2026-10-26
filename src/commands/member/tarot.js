import { randomInt } from "node:crypto";
import { PREFIX } from "../../config.js";
import { getUserName } from "../../utils/index.js";

const MAJOR_ARCANA = [
  {
    name: "O Louco",
    meaning: "Um novo caminho se abre. Avance com curiosidade, sem ignorar os riscos.",
  },
  {
    name: "O Mago",
    meaning: "Você já tem recursos para agir. Transforme intenção em atitude.",
  },
  {
    name: "A Sacerdotisa",
    meaning: "Nem tudo foi revelado. Observe em silêncio e escute sua intuição.",
  },
  {
    name: "A Imperatriz",
    meaning: "Nutra o que deseja ver crescer; cuidado e criatividade dão frutos.",
  },
  {
    name: "O Imperador",
    meaning: "Estrutura e limites ajudam a recuperar o controle da situação.",
  },
  {
    name: "O Hierofante",
    meaning: "Uma tradição, estudo ou conselho confiável pode iluminar sua escolha.",
  },
  {
    name: "Os Enamorados",
    meaning: "Uma decisão pede alinhamento entre seus valores e suas atitudes.",
  },
  {
    name: "O Carro",
    meaning: "Determinação move você adiante; mantenha o foco sem atropelar ninguém.",
  },
  {
    name: "A Justiça",
    meaning: "Pondere os fatos com honestidade e assuma as consequências das escolhas.",
  },
  {
    name: "O Eremita",
    meaning: "Um tempo de recolhimento pode trazer a resposta que o ruído esconde.",
  },
  {
    name: "A Roda da Fortuna",
    meaning: "O cenário está mudando. Adapte-se ao ciclo em vez de tentar controlá-lo.",
  },
  {
    name: "A Força",
    meaning: "Coragem também é agir com paciência e dominar os próprios impulsos.",
  },
  {
    name: "O Enforcado",
    meaning: "Mude o ponto de vista antes de insistir. Uma pausa também é movimento.",
  },
  {
    name: "A Morte",
    meaning: "Um ciclo pede encerramento para que algo novo possa começar.",
  },
  {
    name: "A Temperança",
    meaning: "Equilíbrio e tempo ajudam a unir partes que pareciam incompatíveis.",
  },
  {
    name: "O Diabo",
    meaning: "Reconheça a dependência ou tentação que limita sua liberdade de escolha.",
  },
  {
    name: "A Torre",
    meaning: "Uma estrutura instável pode ruir; encare a verdade e reconstrua com base firme.",
  },
  {
    name: "A Estrela",
    meaning: "Depois do desgaste, há espaço para esperança, cura e novos planos.",
  },
  {
    name: "A Lua",
    meaning: "Nem tudo está claro. Evite conclusões apressadas enquanto a névoa não passa.",
  },
  {
    name: "O Sol",
    meaning: "Clareza e vitalidade favorecem um passo sincero e confiante.",
  },
  {
    name: "O Julgamento",
    meaning: "Uma compreensão importante chama você a aprender com o passado e responder.",
  },
  {
    name: "O Mundo",
    meaning: "Uma etapa se completa. Reconheça o caminho percorrido antes do próximo ciclo.",
  },
];

const SPREAD = [
  { position: "PASSADO", prompt: "A marca que trouxe você até aqui" },
  { position: "PRESENTE", prompt: "A energia que envolve este momento" },
  { position: "CONSELHO", prompt: "O caminho que merece sua atenção" },
];

function drawCards(count) {
  const deck = [...MAJOR_ARCANA];
  const cards = [];

  while (cards.length < count) {
    const [card] = deck.splice(randomInt(deck.length), 1);
    cards.push(card);
  }

  return cards;
}

export default {
  name: "tarot",
  description: "Faz uma tiragem simbólica de três cartas de tarot.",
  commands: ["tarot", "cartas"],
  usage: `${PREFIX}tarot [sua pergunta]`,

  handle: async ({ fullArgs, sendReply, webMessage, userLid }) => {
    const userName = getUserName(webMessage, userLid, "Viajante")
      .replace(/[\r\n]/g, " ")
      .slice(0, 36);
    const question =
      fullArgs?.trim().replace(/[\r\n]/g, " ").slice(0, 120) || "";
    const cards = drawCards(SPREAD.length);
    const reading = SPREAD.map(
      ({ position, prompt }, index) =>
        `╭─❏ 🃏 *${position}* — ${prompt}\n` +
        `│ ✦ *${cards[index].name}*\n` +
        `╰ ${cards[index].meaning}`,
    ).join("\n\n");

    await sendReply(
      `⛧━━━━━━༺𖤐༻━━━━━━⛧
       𝐎 𝐕𝐄́𝐔 𝐃𝐎 𝐓𝐀𝐑𝐎𝐓
⛧━━━━━━━⛓️━━━━━━━⛧

☽ Consulta de: *${userName}*${question ? `\n🔮 Pergunta: _${question}_` : ""}

${reading}

🩸 As cartas apontam símbolos; suas escolhas escrevem o caminho.
Leitura para reflexão e entretenimento — não é uma previsão garantida.`,
    );
  },
};
