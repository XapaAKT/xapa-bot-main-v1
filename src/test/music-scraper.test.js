import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getYoutubeVideoId } from "../services/music-scraper.js";

describe("getYoutubeVideoId", () => {
  it("extracts IDs from standard YouTube URL formats", () => {
    assert.equal(
      getYoutubeVideoId("https://www.youtube.com/watch?v=video123"),
      "video123",
    );
    assert.equal(
      getYoutubeVideoId("https://youtu.be/video456?t=10"),
      "video456",
    );
    assert.equal(
      getYoutubeVideoId("https://youtube.com/shorts/video789"),
      "video789",
    );
  });

  it("rejects links outside YouTube domains", () => {
    assert.equal(
      getYoutubeVideoId("https://example.com/watch?v=video123"),
      null,
    );
    assert.equal(
      getYoutubeVideoId("https://youtube.com.example.org/watch?v=video123"),
      null,
    );
  });
});
