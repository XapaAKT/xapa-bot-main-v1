import { PREFIX } from "../../config.js";

export default {
  name: "telefone",
  description: "Busca informações de telefone",
  commands: ["telefone", "tel"],
  usage: `${PREFIX}telefone <numero>`,

  handle: async ({ sendReply, args }) => {
    if (!args.length) {
      return await sendReply(`⚠️ Uso incorreto!\n${usage}`);
    }

    const numero = args[0];
    
    try {
      // Formatando número para a API
      const numeroFormatado = numero.replace(/[^\d]/g, '');
      
      // Fazendo requisição à API
      const response = await fetch(`https://www.whatsapp-api.com/search?phone=${encodeURIComponent(numeroFormatado)}`);
      
      if (!response.ok) {
        return await sendReply(`⚠️ Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        return await sendReply(`⚠️ Erro: ${data.error}`);
      }

      // Montando resposta formatada
      const resposta = `📞 *INFORMAÇÕES DO TELEFONE*

🔢 Número: ${data.phone}
🌐 País: ${data.country}
📍 Região: ${data.region}
🏙️ Cidade: ${data.city}
📡 Operadora: ${data.carrier}
🕒 Fuso Horário: ${data.timezone}`;

      await sendReply(resposta);

    } catch (error) {
      await sendReply(`⚠️ Erro ao buscar dados: ${error.message}`);
    }
  },
};