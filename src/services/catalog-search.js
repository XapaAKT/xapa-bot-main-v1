import axios from "axios";
import { PREFIX } from "../config.js";
import { errorLog } from "../utils/logger.js";

const JIKAN_API_URL = "https://api.jikan.moe/v4";
const ANILIST_API_URL = "https://graphql.anilist.co";
const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const REQUEST_TIMEOUT = 15000;
const JIKAN_TIMEOUT = 8000;

function shorten(text, maxLength = 360) {
  const cleanText = String(text || "").replace(/\s+/g, " ").trim();
  if (cleanText.length <= maxLength) {
    return cleanText || "Sinopse indisponível.";
  }

  return `${cleanText.slice(0, maxLength - 1).trimEnd()}…`;
}

function joinGenres(genres) {
  return (
    genres
      ?.map((genre) => (typeof genre === "string" ? genre : genre.name))
      .filter(Boolean)
      .join(", ") || "Não informado"
  );
}

function jikanItem(data, type) {
  return {
    title: data.title || data.title_english || "Sem título",
    score: data.score == null ? "Não avaliado" : data.score.toFixed(2),
    synopsis: shorten(data.synopsis),
    genres: joinGenres(data.genres),
    status: data.status || "Não informado",
    countLabel: type === "anime" ? "Episódios" : "Capítulos",
    count: type === "anime" ? data.episodes : data.chapters,
    poster:
      data.images?.webp?.large_image_url ||
      data.images?.jpg?.large_image_url ||
      data.images?.jpg?.image_url ||
      null,
    url: data.url,
  };
}

async function searchJikan(query, type) {
  const response = await axios.get(`${JIKAN_API_URL}/${type}`, {
    params: { q: query, limit: 1, sfw: true },
    timeout: JIKAN_TIMEOUT,
  });
  const result = response.data?.data?.[0];
  return result ? jikanItem(result, type) : null;
}

function anilistItem(data, type) {
  const score = data.averageScore;
  const status = {
    FINISHED: "Finalizado",
    RELEASING: "Em lançamento",
    NOT_YET_RELEASED: "Ainda não lançado",
    CANCELLED: "Cancelado",
    HIATUS: "Em hiato",
  }[data.status] || "Não informado";

  return {
    title: data.title?.english || data.title?.romaji || "Sem título",
    score: score == null ? "Não avaliado" : (score / 10).toFixed(2),
    synopsis: shorten(data.description),
    genres: joinGenres(data.genres),
    status,
    countLabel: type === "anime" ? "Episódios" : "Capítulos",
    count: type === "anime" ? data.episodes : data.chapters,
    poster: data.coverImage?.large || null,
    url: data.siteUrl,
    source: "AniList (fallback)",
  };
}

function normalizeTitle(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function selectAniListResult(results, query) {
  const normalizedQuery = normalizeTitle(query);
  const titles = (item) =>
    [item.title?.english, item.title?.romaji, item.title?.native]
      .map(normalizeTitle)
      .filter(Boolean);

  const directMatches = results
    .flatMap((item) =>
      titles(item).map((title) => {
        if (title === normalizedQuery) {
          return { item, score: 0 };
        }
        if (title.startsWith(`${normalizedQuery} `)) {
          return { item, score: title.length - normalizedQuery.length };
        }
        if (normalizedQuery.startsWith(`${title} `)) {
          return { item, score: 1000 + normalizedQuery.length - title.length };
        }
        return null;
      }),
    )
    .filter(Boolean)
    .sort((left, right) => left.score - right.score);

  if (directMatches.length) {
    return directMatches[0].item;
  }

  const queryWords = [...new Set(normalizedQuery.split(" ").filter(Boolean))];
  if (!queryWords.length) {
    return null;
  }

  const minimumMatch = queryWords.length <= 2 ? 1 : 0.67;
  const rankedResults = results
    .map((item) => {
      const bestMatch = Math.max(
        ...titles(item).map((title) => {
          const titleWords = new Set(title.split(" "));
          const matchedWords = queryWords.filter((word) => titleWords.has(word));
          return matchedWords.length / queryWords.length;
        }),
      );
      return { item, score: bestMatch };
    })
    .sort((left, right) => right.score - left.score);

  return rankedResults[0]?.score >= minimumMatch
    ? rankedResults[0].item
    : null;
}

async function searchAniList(query, type) {
  const graphqlQuery = `
    query ($search: String!, $type: MediaType!) {
      Page(perPage: 10) {
        media(search: $search, type: $type) {
          title { romaji english }
          averageScore
          description(asHtml: false)
          genres
          status
          episodes
          chapters
          coverImage { large }
          siteUrl
        }
      }
    }
  `;
  const response = await fetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: graphqlQuery,
      variables: { search: query, type: type.toUpperCase() },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  if (!response.ok) {
    throw new Error(`AniList respondeu com HTTP ${response.status}.`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error("AniList não conseguiu processar a busca.");
  }

  const result = selectAniListResult(payload.data?.Page?.media || [], query);
  return result ? anilistItem(result, type) : null;
}

async function searchAnimeOrManga(query, type) {
  let jikanResult;
  let jikanError;
  try {
    jikanResult = await searchJikan(query, type);
  } catch (error) {
    jikanError = error;
  }

  if (jikanResult) {
    return jikanResult;
  }

  let anilistResult;
  let anilistError;
  try {
    anilistResult = await searchAniList(query, type);
  } catch (error) {
    anilistError = error;
  }

  if (anilistResult) {
    return anilistResult;
  }
  if (jikanError && anilistError) {
    throw new AggregateError(
      [jikanError, anilistError],
      "Jikan e AniList não conseguiram concluir a busca.",
    );
  }
  if (jikanError) {
    throw jikanError;
  }
  if (anilistError) {
    throw anilistError;
  }

  return null;
}

async function searchTmdb(query, type) {
  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("TMDB_API_KEY não está configurada no ambiente.");
  }

  const endpoint = type === "movie" ? "movie" : "tv";
  const searchResponse = await axios.get(`${TMDB_API_URL}/search/${endpoint}`, {
    params: {
      api_key: apiKey,
      language: "pt-BR",
      query,
      include_adult: false,
    },
    timeout: REQUEST_TIMEOUT,
  });
  const result = searchResponse.data?.results?.[0];
  if (!result) {
    return null;
  }

  const detailsResponse = await axios.get(
    `${TMDB_API_URL}/${endpoint}/${result.id}`,
    {
      params: { api_key: apiKey, language: "pt-BR" },
      timeout: REQUEST_TIMEOUT,
    },
  );
  const details = detailsResponse.data;
  const releaseDate = details.release_date || details.first_air_date || "";

  return {
    title: details.title || details.name || result.title || result.name || "Sem título",
    score: details.vote_average == null ? "Não avaliado" : details.vote_average.toFixed(1),
    synopsis: shorten(details.overview || result.overview),
    genres: joinGenres(details.genres),
    releaseDate: releaseDate || "Não informada",
    poster: details.poster_path
      ? `${TMDB_IMAGE_URL}${details.poster_path}`
      : result.poster_path
        ? `${TMDB_IMAGE_URL}${result.poster_path}`
        : null,
    url: `https://www.themoviedb.org/${endpoint}/${details.id}`,
  };
}

export async function searchCatalog(query, type) {
  if (type === "anime" || type === "manga") {
    return searchAnimeOrManga(query, type);
  }
  if (type === "movie" || type === "tv") {
    return searchTmdb(query, type);
  }

  throw new Error(`Tipo de catálogo não suportado: ${type}`);
}

function catalogErrorReply(type, error) {
  if (type === "movie" || type === "tv") {
    if (error.message?.includes("TMDB_API_KEY")) {
      return "TMDB_API_KEY não foi carregada. Confira o arquivo .env na pasta raiz do bot e reinicie o processo.";
    }

    const status = error.response?.status;
    if (status === 401 || status === 403) {
      return `O TMDB recusou a chave (HTTP ${status}). Confira TMDB_API_KEY no ambiente.`;
    }
    if (status) {
      return `O TMDB respondeu com HTTP ${status}. Tente novamente mais tarde.`;
    }
    if (error.code) {
      return `Não consegui conectar ao TMDB (${error.code}). Verifique a conexão do servidor.`;
    }
    return "Não consegui consultar o TMDB. Verifique a configuração da API e tente novamente.";
  }

  if (error instanceof AggregateError) {
    const errorCodes = error.errors
      .map((cause) => cause.code || (cause.response?.status && `HTTP ${cause.response.status}`))
      .filter(Boolean);
    const detail = errorCodes.length ? ` (${errorCodes.join(", ")})` : "";
    return `Não consegui consultar Jikan nem AniList${detail}. Verifique a conexão do servidor.`;
  }

  const status = error.response?.status;
  if (status) {
    return `Jikan respondeu com HTTP ${status} e não encontrei um resultado no AniList.`;
  }
  if (error.code) {
    return `Não consegui conectar ao Jikan nem encontrar um resultado no AniList (${error.code}).`;
  }
  return "Não consegui consultar Jikan ou AniList agora. Tente novamente em instantes.";
}

export function createCatalogCommand({ type, name, description, countLabel }) {
  return {
    name,
    description,
    commands: [name],
    usage: `${PREFIX}${name} <nome>`,
    handle: async ({
      fullArgs,
      sendWaitReact,
      sendSuccessReact,
      sendSuccessReply,
      sendWarningReply,
      sendErrorReply,
      sendImageFromURL,
    }) => {
      const query = String(fullArgs || "").trim();
      if (!query) {
        await sendWarningReply(
          `Informe o nome para pesquisar. Exemplo: ${PREFIX}${name} One Piece`,
        );
        return;
      }

      await sendWaitReact();

      let item;
      try {
        item = await searchCatalog(query, type);
      } catch (error) {
        errorLog(`[${name.toUpperCase()}] ${error.message || error}`);
        await sendErrorReply(catalogErrorReply(type, error));
        return;
      }

      if (!item) {
        await sendWarningReply("Não encontrei resultados para essa pesquisa.");
        return;
      }

      const details = [
        `🎬 *${item.title}*`,
        `⭐ Nota: ${item.score}`,
        `📝 Sinopse: ${item.synopsis}`,
        `🏷️ Gêneros: ${item.genres}`,
        ...(item.status ? [`📌 Status: ${item.status}`] : []),
        ...(countLabel
          ? [`📚 ${countLabel}: ${item.count ?? "Não informado"}`]
          : [`📅 Lançamento: ${item.releaseDate}`]),
        ...(item.source ? [`🔎 Fonte: ${item.source}`] : []),
        `🔗 ${item.url}`,
      ].join("\n");

      if (item.poster) {
        try {
          await sendImageFromURL(item.poster, details);
          await sendSuccessReact();
        } catch (error) {
          errorLog(`[${name.toUpperCase()}] Falha ao enviar o pôster: ${error.message || error}`);
          await sendSuccessReply(`${details}\n\n⚠️ Não consegui enviar o pôster.`);
        }
      } else {
        await sendSuccessReply(details);
      }
    },
  };
}
