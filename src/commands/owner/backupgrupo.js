import fs from "fs";
import path from "path";
import { PREFIX } from "../../config.js";

export default {
    name: "backupgrupo",
    description: "Faz backup do grupo",
    commands: ["backupgrupo"],
    usage: `${PREFIX}backupgrupo`,

    handle: async ({
        socket,
        remoteJid,
        isGroup,
        sendReply
    }) => {

        if (!isGroup)
            return sendReply("Esse comando funciona apenas em grupos.");

        const metadata = await socket.groupMetadata(remoteJid);

        const pasta = "./database/backups/grupos";

        if (!fs.existsSync(pasta))
            fs.mkdirSync(pasta, { recursive: true });

        let foto = null;

        try{
            foto = await socket.profilePictureUrl(remoteJid,"image");
        }catch{}

        const dados = {

            id: metadata.id,

            nome: metadata.subject,

            descricao: metadata.desc || "",

            foto,

            criado: Date.now(),

            participantes: metadata.participants.length

        };

        fs.writeFileSync(

            path.join(pasta, `${remoteJid}.json`),

            JSON.stringify(dados,null,4)

        );

        sendReply(
`✅ Backup realizado.

Nome:
${dados.nome}

Participantes:
${dados.participantes}

Arquivo salvo.`
        );

    }
};