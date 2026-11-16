import assert from "node:assert/strict";
import test from "node:test";
import axios from "axios";
import {
  createCatalogCommand,
  searchCatalog,
} from "../services/catalog-search.js";

async function withMockedAxios(responseFor, callback) {
  const originalAdapter = axios.defaults.adapter;
  axios.defaults.adapter = async (config) => ({
    data: responseFor(config),
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  });

  try {
    return await callback();
  } finally {
    axios.defaults.adapter = originalAdapter;
  }
}

test("Jikan results include anime and manga details", async () => {
  await withMockedAxios(
    (config) => ({
      data: [
        {
          title: "One Piece",
          score: 8.7,
          synopsis: "A short synopsis.",
          genres: [{ name: "Adventure" }],
          status: "Finished Airing",
          episodes: config.url.endsWith("/anime") ? 1000 : null,
          chapters: config.url.endsWith("/manga") ? 1100 : null,
          images: { webp: { large_image_url: "https://example.com/poster.jpg" } },
          url: "https://example.com/title",
        },
      ],
    }),
    async () => {
      const anime = await searchCatalog("One Piece", "anime");
      const manga = await searchCatalog("One Piece", "manga");

      assert.equal(anime.count, 1000);
      assert.equal(anime.score, "8.70");
      assert.equal(anime.genres, "Adventure");
      assert.equal(manga.count, 1100);
      assert.equal(manga.poster, "https://example.com/poster.jpg");
    },
  );
});

test("anime falls back to AniList when Jikan times out", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://graphql.anilist.co");
    const request = JSON.parse(options.body);
    assert.equal(request.variables.type, "ANIME");
    return {
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          Page: {
            media: [
              {
                title: { romaji: "Onigiri", english: "Onigiri" },
                averageScore: 65,
                description: "An unrelated first result.",
                genres: ["Action"],
                status: "FINISHED",
                episodes: 12,
                coverImage: { large: "https://example.com/onigiri.jpg" },
                siteUrl: "https://anilist.co/anime/2",
              },
              {
                title: {
                  romaji: "Kimetsu no Yaiba",
                  english: "Demon Slayer: Kimetsu no Yaiba",
                },
                averageScore: 84,
                description: "A short synopsis.",
                genres: ["Action", "Fantasy"],
                status: "FINISHED",
                episodes: 26,
                coverImage: { large: "https://example.com/cover.jpg" },
                siteUrl: "https://anilist.co/anime/1",
              },
            ],
          },
        },
      }),
    };
  };

  try {
    await withMockedAxios(() => {
      const error = new Error("connect ETIMEDOUT");
      error.code = "ETIMEDOUT";
      throw error;
    }, async () => {
      const result = await searchCatalog("Demon Slayer", "anime");

      assert.equal(result.title, "Demon Slayer: Kimetsu no Yaiba");
      assert.equal(result.score, "8.40");
      assert.equal(result.count, 26);
      assert.equal(result.source, "AniList (fallback)");
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("catalog commands return text when the poster cannot be sent", async () => {
  const command = createCatalogCommand({
    type: "anime",
    name: "anime",
    description: "Search anime",
    countLabel: "Episódios",
  });
  let reply;

  await withMockedAxios(
    () => ({
      data: [
        {
          title: "Demon Slayer",
          score: 8.7,
          synopsis: "A short synopsis.",
          genres: [{ name: "Action" }],
          status: "Finished Airing",
          episodes: 26,
          images: { jpg: { image_url: "https://example.com/poster.jpg" } },
          url: "https://example.com/title",
        },
      ],
    }),
    () =>
      command.handle({
        fullArgs: "Demon Slayer",
        sendWaitReact: async () => {},
        sendSuccessReact: async () => {},
        sendSuccessReply: async (text) => {
          reply = text;
        },
        sendWarningReply: async () => {},
        sendErrorReply: async (text) => {
          throw new Error(text);
        },
        sendImageFromURL: async () => {
          throw new Error("Image host unavailable");
        },
      }),
  );

  assert.match(reply, /Demon Slayer/);
  assert.match(reply, /Não consegui enviar o pôster/);
});

test("TMDB results include localized genres, release date, and link", async () => {
  const originalApiKey = process.env.TMDB_API_KEY;
  process.env.TMDB_API_KEY = "test-api-key";

  try {
    await withMockedAxios(
      (config) =>
        config.url.endsWith("/search/movie")
          ? {
              results: [
                {
                  id: 42,
                  title: "Example Movie",
                  poster_path: "/poster.jpg",
                },
              ],
            }
          : {
              id: 42,
              title: "Example Movie",
              overview: "A short synopsis.",
              vote_average: 8.1,
              genres: [{ name: "Drama" }],
              release_date: "2025-01-02",
              poster_path: "/poster.jpg",
            },
      async () => {
        const movie = await searchCatalog("Example Movie", "movie");

        assert.equal(movie.title, "Example Movie");
        assert.equal(movie.score, "8.1");
        assert.equal(movie.genres, "Drama");
        assert.equal(movie.releaseDate, "2025-01-02");
        assert.equal(movie.poster, "https://image.tmdb.org/t/p/w500/poster.jpg");
        assert.equal(movie.url, "https://www.themoviedb.org/movie/42");
      },
    );
  } finally {
    if (originalApiKey === undefined) {
      delete process.env.TMDB_API_KEY;
    } else {
      process.env.TMDB_API_KEY = originalApiKey;
    }
  }
});
