import { PREFIX } from "../../config.js";
import { DangerError } from "../../errors/index.js";

const ddds = {
  "11": "São Paulo (Capital e Região Metropolitana)",
  "12": "Vale do Paraíba - SP",
  "13": "Baixada Santista - SP",
  "14": "Bauru e região - SP",
  "15": "Sorocaba e região - SP",
  "16": "Ribeirão Preto e região - SP",
  "17": "São José do Rio Preto e região - SP",
  "18": "Presidente Prudente e região - SP",
  "19": "Campinas e região - SP",

  "21": "Rio de Janeiro - RJ",
  "22": "Campos dos Goytacazes - RJ",
  "24": "Volta Redonda/Petrópolis - RJ",

  "27": "Espírito Santo",
  "28": "Sul do Espírito Santo",

  "31": "Belo Horizonte e região - MG",
  "32": "Juiz de Fora e região - MG",
  "33": "Governador Valadares e região - MG",
  "34": "Uberlândia/Uberaba - MG",
  "35": "Sul de Minas",
  "37": "Divinópolis e região - MG",
  "38": "Montes Claros e Norte de Minas",

  "41": "Curitiba e região - PR",
  "42": "Ponta Grossa e região - PR",
  "43": "Londrina e região - PR",
  "44": "Maringá e região - PR",
  "45": "Cascavel/Foz do Iguaçu - PR",
  "46": "Pato Branco e região - PR",

  "47": "Blumenau/Joinville - SC",
  "48": "Florianópolis e região - SC",
  "49": "Oeste de Santa Catarina",

  "51": "Porto Alegre e região - RS",
  "53": "Pelotas/Rio Grande - RS",
  "54": "Caxias do Sul e região - RS",
  "55": "Santa Maria e região - RS",

  "61": "Distrito Federal",

  "62": "Goiás",
  "64": "Sul de Goiás",

  "63": "Tocantins",

  "65": "Cuiabá e região - MT",
  "66": "Interior de Mato Grosso",

  "67": "Mato Grosso do Sul",

  "68": "Acre",

  "69": "Rondônia",

  "71": "Salvador - BA",
  "73": "Sul da Bahia",
  "74": "Juazeiro e região - BA",
  "75": "Feira de Santana e região - BA",
  "77": "Vitória da Conquista e região - BA",

  "79": "Sergipe",

  "81": "Recife e região - PE",
  "87": "Interior de Pernambuco",

  "82": "Alagoas",

  "83": "Paraíba",

  "84": "Rio Grande do Norte",

  "85": "Fortaleza e região - CE",
  "88": "Interior do Ceará",

  "86": "Teresina e região - PI",
  "89": "Interior do Piauí",

  "91": "Belém e região - PA",
  "93": "Oeste do Pará",
  "94": "Sul/Sudeste do Pará",

  "92": "Manaus e região - AM",
  "97": "Interior do Amazonas",

  "95": "Roraima",

  "96": "Amapá",

  "98": "São Luís e região - MA",
  "99": "Interior do Maranhão"
};

export default {
  name: "ddd",
  description: "Consulta um DDD brasileiro.",
  commands: ["ddd"],
  usage: `${PREFIX}ddd 31`,

  handle: async ({ args, sendReply }) => {
    const ddd = args[0];

    if (!ddd) {
      throw new DangerError(`Use: ${PREFIX}ddd 31`);
    }

    if (!ddds[ddd]) {
      throw new DangerError("DDD não encontrado.");
    }

    await sendReply(
`📞 *Consulta de DDD*

🔎 DDD: *${ddd}*

📍 Região:
${ddds[ddd]}`
    );
  },
};