import { PREFIX } from "../../../config.js";

const HELP_TEXT = `╭━━〔 ⚔️ GUIA DO RPG XAPA 〕━━╮
┃
┃ 🎮 COMO COMEÇAR
┃ 1. Um administrador ativa: ${PREFIX}rpg on
┃ 2. Escolha uma classe:
┃    ${PREFIX}rpgclasse guerreiro
┃    ${PREFIX}rpgclasse mago
┃    ${PREFIX}rpgclasse cacador
┃    ${PREFIX}rpgclasse paladino
┃    ${PREFIX}rpgclasse ladino
┃    ${PREFIX}rpgclasse druida
┃ 3. Escolha uma profissão:
┃    ${PREFIX}rpgprofissao ferreiro
┃
┃ 🧭 SUA AVENTURA
┃ ${PREFIX}perfil — status, nível e atributos
┃ ${PREFIX}explorar — encontra moedas, itens ou monstros
┃ ${PREFIX}mochila — vê seus itens e equipamentos
┃
┃ ⚔️ BATALHAS
┃ ${PREFIX}batalha slime
┃ Monstros: slime, goblin, lobo e dragao
┃ ${PREFIX}ataca — ataca o inimigo
┃ ${PREFIX}fugir — encerra a batalha
┃
┃ 🏪 LOJA E EQUIPAMENTOS
┃ ${PREFIX}loja — mostra os produtos
┃ ${PREFIX}comprar espada
┃ Itens: espada, armadura, cajado e pocao
┃
┃ 💡 DICAS
┃ • Vitórias dão XP, moedas e itens.
┃ • Equipamentos aumentam seus atributos.
┃ • Classe e profissão são permanentes.
┃ • O progresso fica salvo mesmo se o RPG for desligado.
┃
╰━━━━━━━━━━━━━━━━━━╯`;

export default {
  name: "rpghelp",
  description: "Ensina como jogar o RPG.",
  commands: ["rpghelp", "helprpg", "ajudarpg", "ajuda", "help"],
  usage: `${PREFIX}ajuda`,
  requiresRpg: true,
  handle: async ({ sendReply }) => sendReply(HELP_TEXT),
};
