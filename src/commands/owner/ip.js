import { PREFIX } from "../../config.js";

export default {
  name: "endereco",
  description: "Consulta informações de IP",
  commands: ["endereco", "ip"],
  usage: `${PREFIX}endereco <ip>`,

  handle: async ({ sendReply, args }) => {
    if (!args.length) {
      return await sendReply(`⚠️ Uso incorreto!\n${usage}`);
    }

    const ip = args[0];
    
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();

      if (!data.ip) {
        return await sendReply("⚠️ IP inválido ou não encontrado.");
      }

      await sendReply(`📍 *INFORMAÇÕES DE IP*

🌍 País: ${data.country_name}
🏛️ Região: ${data.region}
🏢 Cidade: ${data.city}
📡 ISP: ${data.org}
🕒 Fuso Horário: ${data.timezone}
🌐 Provedor: ${data.asn}
📊 Latitude: ${data.latitude}
📊 Longitude: ${data.longitude}
🔄 IP: ${data.ip}
`);

    } catch (error) {
      await sendReply(`⚠️ Erro ao buscar dados: ${error.message}`);
    }
  },
};