import yts from "yt-search";

export async function scrapeLyrics(query) {
  const result = await yts(query.trim());
  const video = result.videos?.[0];

  if (!video) {
    throw new Error("Nenhuma música foi encontrada.");
  }

  const artist = video.author?.name || "";
  const title = video.title || query;
  const response = await fetch(
    `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
  );

  if (!response.ok) {
    throw new Error("A letra dessa música não foi encontrada.");
  }

  const data = await response.json();
  if (!data.lyrics?.trim()) {
    throw new Error("A letra dessa música não foi encontrada.");
  }

  return {
    artist,
    title,
    lyrics: data.lyrics.trim(),
  };
}
