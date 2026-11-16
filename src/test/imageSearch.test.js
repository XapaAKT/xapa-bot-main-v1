import assert from "node:assert/strict";
import test from "node:test";
import {
  downloadImage,
  parseImageSearchQuery,
  searchImages,
} from "../services/image-search.js";
import imageCommand from "../commands/member/search/img.js";

function response({
  status = 200,
  body = "",
  contentType = "application/json",
} = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name) =>
        name === "content-type"
          ? contentType
          : name === "content-length"
            ? String(Buffer.byteLength(body))
            : null,
    },
    text: async () => body,
  };
}

function yandexHtml(urls) {
  return urls
    .map(
      (url) =>
        `<div data-bem="{&quot;serp-item&quot;:{&quot;img_href&quot;:&quot;${url}&quot;}}"></div>`,
    )
    .join("");
}

function bingHtml(urls) {
  return urls
    .map(
      (url) =>
        `<div data-m="{&quot;murl&quot;:&quot;${url}&quot;}"></div>`,
    )
    .join("");
}

test("image searches parse adult markers and reject underage terms", () => {
  assert.deepEqual(parseImageSearchQuery("gatos fofos"), {
    query: "gatos fofos",
    adult: false,
  });
  assert.deepEqual(parseImageSearchQuery("hentai +18"), {
    query: "hentai",
    adult: true,
  });
  assert.deepEqual(parseImageSearchQuery("paisagem --adult"), {
    query: "paisagem",
    adult: true,
  });
  assert.throws(() => parseImageSearchQuery("hentai teen +18"), /menores/);
});

test("normal searches try Yandex before Bing and deduplicate results", async () => {
  const originalFetch = globalThis.fetch;
  const searchedHosts = [];
  globalThis.fetch = async (input) => {
    const url = new URL(input);
    searchedHosts.push(url.hostname);

    if (url.hostname === "yandex.com") {
      assert.equal(url.searchParams.get("family"), "on");
      return response({
        body: yandexHtml([
          "https://1.1.1.1/cat.jpg",
          "https://1.1.1.1/cat.jpg",
          "https://1.1.1.1/unknown",
          "https://1.1.1.1/animated.gif",
        ]),
        contentType: "text/html",
      });
    }

    assert.equal(url.hostname, "www.bing.com");
    assert.equal(url.searchParams.get("adlt"), "strict");
    return response({
      body: bingHtml([
        "https://1.1.1.1/cat.jpg",
        "https://1.1.1.1/dog.png",
      ]),
      contentType: "text/html",
    });
  };

  try {
    const images = await searchImages("gatos", false);
    assert.deepEqual(searchedHosts, ["yandex.com", "www.bing.com"]);
    assert.deepEqual(
      images.map((image) => image.url),
      [
        "https://1.1.1.1/cat.jpg",
        "https://1.1.1.1/dog.png",
        "https://1.1.1.1/unknown",
      ],
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("image searches report source failures when no fallback returns results", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = new URL(input);
    if (url.hostname === "yandex.com") {
      return response({ status: 503 });
    }
    return response({ status: 503 });
  };

  try {
    await assert.rejects(searchImages("gatos", false), AggregateError);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("adult searches fall through unavailable APIs to Yande.re", async () => {
  const originalFetch = globalThis.fetch;
  const searchedHosts = [];
  globalThis.fetch = async (input) => {
    const url = new URL(input);
    searchedHosts.push(url.hostname);

    if (url.hostname === "api.rule34.xxx") {
      assert.match(url.searchParams.get("tags"), /rating:explicit/);
      assert.match(url.searchParams.get("tags"), /-loli/);
      return response({ body: JSON.stringify("Missing authentication") });
    }
    if (url.hostname === "gelbooru.com") {
      if (url.searchParams.get("page") === "dapi") {
        return response({ status: 401 });
      }
      return response({ body: "", contentType: "text/html" });
    }
    assert.equal(url.hostname, "yande.re");
    assert.match(url.searchParams.get("tags"), /rating:e/);
    return response({
      body: JSON.stringify([
        {
          file_url: "https://yande.re/data/1.jpg",
          file_ext: "jpg",
          rating: "e",
          tags: "anime girl",
        },
        {
          file_url: "https://yande.re/data/2.png",
          file_ext: "png",
          rating: "e",
          tags: "anime girl",
        },
        {
          file_url: "https://yande.re/data/3.webp",
          file_ext: "webp",
          rating: "e",
          tags: "anime girl",
        },
        {
          file_url: "https://yande.re/data/4.jpg",
          file_ext: "jpg",
          rating: "s",
          tags: "anime girl",
        },
        {
          file_url: "https://yande.re/data/5.jpg",
          file_ext: "jpg",
          rating: "e",
          tags: "anime girl loli",
        },
      ]),
    });
  };

  try {
    const images = await searchImages("anime girl", true);
    assert.equal(searchedHosts[0], "api.rule34.xxx");
    assert.equal(
      searchedHosts.filter((host) => host === "gelbooru.com").length,
      4,
    );
    assert.equal(
      searchedHosts.filter((host) => host === "yande.re").length,
      3,
    );
    assert.deepEqual(
      images.map((image) => image.url),
      [
        "https://yande.re/data/1.jpg",
        "https://yande.re/data/2.png",
        "https://yande.re/data/3.webp",
      ],
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("adult searches treat an empty Yande response as no results, not a source failure", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = new URL(input);
    if (url.hostname === "api.rule34.xxx") {
      return response({ body: JSON.stringify("Missing authentication") });
    }
    if (url.hostname === "gelbooru.com") {
      return url.searchParams.get("page") === "dapi"
        ? response({ status: 401 })
        : response({ body: "", contentType: "text/html" });
    }
    return response({ body: "[]", contentType: "application/json" });
  };

  try {
    assert.deepEqual(await searchImages("anime girl", true), []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("adult searches use Gelbooru's public results page when its API is blocked", async () => {
  const originalFetch = globalThis.fetch;
  const searchedPages = [];
  const searchedTags = [];
  globalThis.fetch = async (input) => {
    const url = new URL(input);
    searchedPages.push(url.searchParams.get("page"));

    if (url.hostname === "api.rule34.xxx") {
      return response({ body: JSON.stringify("Missing authentication") });
    }
    if (url.searchParams.get("page") === "dapi") {
      return response({ status: 401 });
    }
    if (url.hostname === "gelbooru.com") {
      const tags = url.searchParams.get("tags") || "";
      searchedTags.push(tags);
      if (
        url.searchParams.get("page") !== "post" ||
        !tags.split(/\s+/).includes("1girl")
      ) {
        return response({ body: "", contentType: "text/html" });
      }

      return response({
        contentType: "text/html",
        body: [
          "https://1.1.1.1/first.jpg",
          "https://1.1.1.1/second.png",
          "https://1.1.1.1/third.webp",
          "https://1.1.1.1/underage.jpg",
          "https://1.1.1.1/animated.gif",
        ]
          .map((imageUrl, index) => {
            const tags = index === 3 ? "anime loli" : "anime girl";
            return `<article class="thumbnail-preview"><a><img src="${imageUrl}" alt="${tags}" title="${tags}"></a></article>`;
          })
          .join(""),
      });
    }
    return response({ body: "[]", contentType: "application/json" });
  };

  try {
    const images = await searchImages("anime girl", true);
    assert.deepEqual(searchedPages, [
      "dapi",
      "dapi",
      "post",
      "post",
      "post",
      null,
      null,
      null,
    ]);
    assert.ok(searchedTags.some((tags) => tags.split(/\s+/).includes("1girl")));
    assert.deepEqual(
      images.map((image) => image.url),
      [
        "https://1.1.1.1/first.jpg",
        "https://1.1.1.1/second.png",
        "https://1.1.1.1/third.webp",
      ],
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("adult searches convert Demon Slayer into the Yande/Gelbooru canonical tag", async () => {
  const originalFetch = globalThis.fetch;
  const gelbooruQueries = [];
  globalThis.fetch = async (input) => {
    const url = new URL(input);
    if (url.hostname === "api.rule34.xxx") {
      return response({ body: JSON.stringify("Missing authentication") });
    }
    if (url.hostname === "gelbooru.com") {
      if (url.searchParams.get("page") === "dapi") {
        return response({ status: 401 });
      }

      const tags = url.searchParams.get("tags") || "";
      gelbooruQueries.push(tags);
      if (!tags.split(/\s+/).includes("kimetsu_no_yaiba")) {
        return response({ body: "", contentType: "text/html" });
      }

      return response({
        contentType: "text/html",
        body: [1, 2, 3]
          .map(
            (index) =>
              `<article class="thumbnail-preview"><img src="https://1.1.1.1/${index}.jpg" alt="kimetsu_no_yaiba" title="kimetsu_no_yaiba"></article>`,
          )
          .join(""),
      });
    }
    return response({ body: "[]", contentType: "application/json" });
  };

  try {
    const images = await searchImages("Demon slayer hentai", true);
    assert.ok(
      gelbooruQueries.some((tags) =>
        tags.split(/\s+/).includes("kimetsu_no_yaiba"),
      ),
    );
    assert.equal(images.length, 3);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("adult APIs use optional credentials from the environment", async () => {
  const originalFetch = globalThis.fetch;
  const originalRule34UserId = process.env.RULE34_USER_ID;
  const originalRule34ApiKey = process.env.RULE34_API_KEY;
  const originalGelbooruUserId = process.env.GELBOORU_USER_ID;
  const originalGelbooruApiKey = process.env.GELBOORU_API_KEY;
  process.env.RULE34_USER_ID = "test-user";
  process.env.RULE34_API_KEY = "test-rule34-key";
  process.env.GELBOORU_USER_ID = "test-user";
  process.env.GELBOORU_API_KEY = "test-gelbooru-key";
  globalThis.fetch = async (input) => {
    const url = new URL(input);
    if (url.hostname === "api.rule34.xxx") {
      assert.equal(url.searchParams.get("user_id"), "test-user");
      assert.equal(url.searchParams.get("api_key"), "test-rule34-key");
    } else if (url.hostname === "gelbooru.com") {
      assert.equal(url.searchParams.get("user_id"), "test-user");
      assert.equal(url.searchParams.get("api_key"), "test-gelbooru-key");
    }
    return response({ body: "[]" });
  };

  try {
    assert.deepEqual(await searchImages("anime", true), []);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalRule34UserId === undefined) {
      delete process.env.RULE34_USER_ID;
    } else {
      process.env.RULE34_USER_ID = originalRule34UserId;
    }
    if (originalRule34ApiKey === undefined) {
      delete process.env.RULE34_API_KEY;
    } else {
      process.env.RULE34_API_KEY = originalRule34ApiKey;
    }
    if (originalGelbooruUserId === undefined) {
      delete process.env.GELBOORU_USER_ID;
    } else {
      process.env.GELBOORU_USER_ID = originalGelbooruUserId;
    }
    if (originalGelbooruApiKey === undefined) {
      delete process.env.GELBOORU_API_KEY;
    } else {
      process.env.GELBOORU_API_KEY = originalGelbooruApiKey;
    }
  }
});

test("image downloads validate content and reject private network addresses", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCount = 0;
  globalThis.fetch = async () => {
    fetchCount += 1;
    return {
      ok: true,
      status: 200,
      headers: {
        get: (name) =>
          name === "content-type"
            ? "image/jpeg"
            : name === "content-length"
              ? "5"
              : null,
      },
      body: (async function* () {
        yield Buffer.from("image");
      })(),
    };
  };

  try {
    const image = await downloadImage({
      url: "https://1.1.1.1/cat.jpg",
      referer: "https://yandex.com/",
    });
    assert.equal(image.toString(), "image");
    await assert.rejects(
      downloadImage({
        url: "https://127.0.0.1/image.jpg",
        referer: "https://yandex.com/",
      }),
      /host não público/,
    );
    assert.equal(fetchCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("img sends up to fifteen downloaded images as one album", async () => {
  const originalFetch = globalThis.fetch;
  const originalLog = console.log;
  const sentMessages = [];
  globalThis.fetch = async (input) => {
    const url = new URL(input);
    if (url.hostname === "yandex.com") {
      return response({
        body: yandexHtml(
          Array.from(
            { length: 20 },
            (_, index) => `https://1.1.1.1/${index}.jpg`,
          ),
        ),
        contentType: "text/html",
      });
    }
    if (url.hostname === "www.bing.com") {
      assert.equal(url.searchParams.get("adlt"), "strict");
      return response({
        body: bingHtml(
          Array.from(
            { length: 20 },
            (_, index) => `https://1.1.1.1/${index + 20}.jpg`,
          ),
        ),
        contentType: "text/html",
      });
    }

    const imageIndex = Number(url.pathname.match(/\d+/)?.[0]);
    const imageBuffer = Buffer.from(`image-${imageIndex}`);
    return {
      headers: {
        get: (name) =>
          name === "content-type"
            ? "image/jpeg"
            : name === "content-length"
              ? String(imageBuffer.length)
              : null,
      },
      status: imageIndex < 2 ? 403 : 200,
      ok: imageIndex >= 2,
      body: (async function* () {
        yield imageBuffer;
      })(),
    };
  };
  console.log = () => {};

  try {
    await imageCommand.handle({
      fullArgs: "gatos",
      sendWaitReact: async () => {},
      sendSuccessReact: async () => {},
      sendWarningReply: async (message) => {
        throw new Error(message);
      },
      sendErrorReply: async (message) => {
        throw new Error(message);
      },
      socket: {
        sendMessage: async (remoteJid, message) => {
          sentMessages.push({ remoteJid, message });
        },
      },
      remoteJid: "123@s.whatsapp.net",
    });
  } finally {
    globalThis.fetch = originalFetch;
    console.log = originalLog;
  }

  assert.equal(sentMessages.length, 1);
  assert.equal(sentMessages[0].message.album.length, 15);
  assert.equal(sentMessages[0].message.caption, "🔎 Imagens: gatos");
  assert.deepEqual(
    sentMessages[0].message.album.map((item) => item.image.toString()),
    Array.from({ length: 15 }, (_, index) => `image-${index + 2}`),
  );
});

test("img explains when adult sources return no matching tags", async () => {
  const originalFetch = globalThis.fetch;
  const warnings = [];
  globalThis.fetch = async (input) => {
    const url = new URL(input);
    if (url.hostname === "api.rule34.xxx") {
      return response({ body: JSON.stringify("Missing authentication") });
    }
    if (url.hostname === "gelbooru.com") {
      return url.searchParams.get("page") === "dapi"
        ? response({ status: 401 })
        : response({ body: "", contentType: "text/html" });
    }
    return response({ body: "[]", contentType: "application/json" });
  };

  try {
    await imageCommand.handle({
      fullArgs: "Demon slayer hentai",
      sendWaitReact: async () => {},
      sendSuccessReact: async () => {},
      sendWarningReply: async (message) => {
        warnings.push(message);
      },
      sendErrorReply: async (message) => {
        throw new Error(message);
      },
      socket: { sendMessage: async () => {} },
      remoteJid: "123@s.whatsapp.net",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.deepEqual(warnings, [
    "⚠️ Conteúdo adulto",
    "Não encontrei imagens +18 com essas tags. Tente usar tags canônicas (por exemplo, kimetsu_no_yaiba) ou configure o acesso às APIs Rule34/Gelbooru.",
  ]);
});
