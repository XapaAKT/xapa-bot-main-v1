/**
 * Comunicação com a Tokito APIs.
 *
 * A Tokito somente fornece os arquivos/dados.
 * O envio para o WhatsApp continua sendo feito pelo Baileys
 * através dos helpers dos próprios comandos.
 */

import axios from "axios";
import {
  TOKITO_API_BASE_URL,
  TOKITO_API_TOKEN,
} from "../config.js";

if (!TOKITO_API_BASE_URL) {
  throw new Error("TOKITO_API_BASE_URL não configurada.");
}

if (!TOKITO_API_TOKEN) {
  throw new Error("TOKITO_API_TOKEN não configurado.");
}

const api = axios.create({
  baseURL: TOKITO_API_BASE_URL,
  timeout: 60_000,
  headers: {
    "x-api-key": TOKITO_API_TOKEN,
    Accept: "application/json",
  },
});

/**
 * Faz uma chamada GET para a Tokito.
 */
async function callTool(endpoint, params = {}) {
  try {
    const { data } = await api.get(endpoint, {
      params,
    });

    return data;
  } catch (error) {
    const status = error.response?.status;
    const responseData = error.response?.data;

    console.error("[TOKITO API ERROR]", {
      endpoint,
      params,
      status,
      response: responseData,
      message: error.message,
    });

    throw new Error(
      status
        ? `Tokito API respondeu com HTTP ${status}.`
        : `Erro ao acessar a Tokito API: ${error.message}`
    );
  }
}

/**
 * ============================================================
 * FIGURINHAS
 * ============================================================
 */

export async function attp(text) {
  if (!text?.trim()) {
    throw new Error("Informe o texto do ATTP.");
  }

  const data = await callTool("/api/stickers/attp", {
    text: text.trim(),
  });

  if (!data?.arquivo) {
    throw new Error("A Tokito não retornou o arquivo do ATTP.");
  }

  return data;
}

export async function ttp(text) {
  if (!text?.trim()) {
    throw new Error("Informe o texto do TTP.");
  }

  const data = await callTool("/api/ttp", {
    text: text.trim(),
  });

  if (!data?.arquivo) {
    throw new Error("A Tokito não retornou o arquivo do TTP.");
  }

  return data;
}

export async function brat(text) {
  if (!text?.trim()) {
    throw new Error("Informe o texto do BRAT.");
  }

  const data = await callTool("/api/stickers/brat-img", {
    text: text.trim(),
  });

  if (!data?.arquivo) {
    throw new Error("A Tokito não retornou o arquivo do BRAT.");
  }

  return data;
}

/**
 * ============================================================
 * IA
 * ============================================================
 */

export async function gemini(text) {
  if (!text?.trim()) {
    throw new Error("Informe a pergunta para o Gemini.");
  }

  const data = await callTool("/api/gemini", {
    q: text.trim(),
  });

  if (!data?.resposta) {
    throw new Error("A Tokito não retornou uma resposta do Gemini.");
  }

  return data.resposta;
}

/**
 * GPT/OpenAI.
 *
 * Mantido para compatibilidade com comandos antigos.
 */
export async function gpt5Mini(text) {
  if (!text?.trim()) {
    throw new Error("Informe o texto.");
  }

  const data = await callTool("/api/openai", {
    text: text.trim(),
  });

  return (
    data?.resposta ??
    data?.response ??
    data?.result ??
    data?.resultado ??
    data
  );
}

/**
 * Ainda não há rota DeepSeek confirmada nos testes que você fez.
 */
export async function deepseekV4Flash() {
  throw new Error(
    "DeepSeek ainda não foi migrado para a Tokito."
  );
}

/**
 * ============================================================
 * YOUTUBE
 * ============================================================
 */

/**
 * Busca uma música.
 *
 * Retorna:
 * {
 *   status,
 *   resultado: {
 *     title,
 *     canal,
 *     duration,
 *     image,
 *     thumbnail,
 *     url,
 *     download,
 *     ...
 *   }
 * }
 */
export async function youtubePlay(search) {
  if (!search?.trim()) {
    throw new Error("Informe o nome da música.");
  }

  const data = await callTool("/api/youtube-play", {
    search: search.trim(),
  });

  if (!data?.status || !data?.resultado) {
    throw new Error(
      "A Tokito não encontrou nenhum resultado no YouTube."
    );
  }

  return data;
}

/**
 * YouTube MP3.
 *
 * Retorna:
 * {
 *   arquivo,
 *   tipo,
 *   tamanho
 * }
 */
export async function ytmp3(url) {
  if (!url?.trim()) {
    throw new Error("Informe a URL do YouTube.");
  }

  const data = await callTool("/api/yt-mp3", {
    url: url.trim(),
  });

  if (!data?.arquivo) {
    throw new Error(
      "A Tokito não retornou o arquivo MP3."
    );
  }

  return data;
}

/**
 * ============================================================
 * FACEBOOK
 * ============================================================
 */

export async function facebook(url) {
  if (!url?.trim()) {
    throw new Error("Informe a URL do Facebook.");
  }

  return callTool("/api/facebook", {
    url: url.trim(),
  });
}

/**
 * ============================================================
 * PINTEREST
 * ============================================================
 */

export async function pinterest(url) {
  if (!url?.trim()) {
    throw new Error("Informe a URL do Pinterest.");
  }

  const data = await callTool("/api/pinterest", {
    url: url.trim(),
  });

  if (!data?.arquivo) {
    throw new Error(
      "A Tokito não retornou o arquivo do Pinterest."
    );
  }

  return data;
}

/**
 * ============================================================
 * PESQUISAS
 * ============================================================
 */

export async function youtubeSearch(search) {
  if (!search?.trim()) {
    throw new Error("Informe o que deseja pesquisar.");
  }

  return callTool("/api/youtube-search", {
    search: search.trim(),
  });
}

export async function pinterestSearch(search) {
  if (!search?.trim()) {
    throw new Error("Informe o que deseja pesquisar.");
  }

  return callTool("/api/pinterest-search", {
    search: search.trim(),
  });
}

/**
 * Compatibilidade com comandos antigos.
 */
export async function search(type, searchText) {
  switch (type) {
    case "youtube":
      return youtubeSearch(searchText);

    case "pinterest":
      return pinterestSearch(searchText);

    default:
      throw new Error(
        `Pesquisa "${type}" ainda não foi migrada.`
      );
  }
}

/**
 * ============================================================
 * COMPATIBILIDADE COM O ANTIGO spider-x-api.js
 * ============================================================
 */

export async function play(type, searchText) {
  if (type === "audio" || type === "youtube" || type === "yt") {
    return youtubePlay(searchText);
  }

  throw new Error(
    `Tipo de play "${type}" não possui rota Tokito configurada.`
  );
}

export async function download(type, url) {
  switch (type) {
    case "facebook":
      return facebook(url);

    case "pinterest":
      return pinterest(url);

    case "youtube":
    case "yt":
    case "audio":
      return ytmp3(url);

    default:
      throw new Error(
        `Download "${type}" ainda não foi migrado.`
      );
  }
}

/**
 * Compatibilidade de nomes usados por comandos antigos.
 */
export const youtubeMp3 = ytmp3;

/**
 * Funções não migradas.
 */
export async function abrat() {
  throw new Error(
    "ABRAT ainda não possui uma rota Tokito configurada."
  );
}

export async function imageAI() {
  throw new Error(
    "Geração de imagem ainda não foi migrada."
  );
}

export async function toGif() {
  throw new Error(
    "Conversão para GIF ainda não foi migrada."
  );
}

export async function removeBg() {
  throw new Error(
    "RemoveBG ainda não foi migrado."
  );
}

export async function setProxy() {
  throw new Error(
    "setProxy pertencia à SpiderX e não está disponível na Tokito."
  );
}

export async function updatePlanUser() {
  throw new Error(
    "updatePlanUser pertencia à SpiderX e não está disponível na Tokito."
  );
}