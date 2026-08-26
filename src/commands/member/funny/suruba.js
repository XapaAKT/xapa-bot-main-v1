import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { onlyNumbers } from "../../../utils/index.js";

export default {
  name: "suruba",
  description: "Inicia uma suruba com o número de pessoas informado.",
  commands: ["suruba", "surubada", "surubão"],
  usage: `${PREFIX}suruba <quantidade>`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendGifFromFile,
    sendErrorReply,
    userLid,
    args,
    remoteJid,
    socket,
  }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "Você precisa informar a quantidade de pessoas para suruba!"
      );
    }

    const quantidade = parseInt(args[0]);
    
    if (isNaN(quantidade) || quantidade <= 0 || quantidade > 50) {
      await sendErrorReply(
        "Quantidade inválida! Informe um número entre 1 e 50."
      );
      return;
    }

    const userNumber = onlyNumbers(userLid);

    // Lista de GIFs
    const gifs = [
      "suruba1.mp4",
      "suruba2.mp4",
      "suruba3.mp4",
    ];

    // Escolhe um gif aleatório
    const gifAleatorio =
      gifs[Math.floor(Math.random() * gifs.length)];

    // Obtém metadados do grupo
    try {
      const groupMetadata = await socket.groupMetadata(remoteJid);
      
      // Seleciona pessoas aleatórias
      const participantes = [];
      const maxParticipantes = Math.min(quantidade, groupMetadata.participants.length);
      
      while (participantes.length < maxParticipantes) {
        const randomIndex = Math.floor(Math.random() * groupMetadata.participants.length);
        const participant = groupMetadata.participants[randomIndex];
        
        if (participant.id !== userLid && !participantes.includes(participant.id)) {
          participantes.push(participant.id);
        }
      }

      // Formata a mensagem
      const mencoes = participantes.map(id => `@${onlyNumbers(id)}`).join(", ");
      const mensagem = `@${userNumber} começou uma suruba com ${maxParticipantes} pessoas!\n\n${mencoes}`;

      await sendGifFromFile(
        path.resolve(ASSETS_DIR, "images", "funny", gifAleatorio),
        mensagem,
        [...participantes, userLid]
      );
    } catch (error) {
      await sendErrorReply("Erro ao obter dados do grupo: " + error.message);
    }
  },
};