const axios = require("axios");

const YT_API_KEY = "AIzaSyDpz0xO4VU4mizNPaDvZWPE_AydwV5TNkU";
const YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YT_VIDEO_URL = "https://www.googleapis.com/youtube/v3/videos";

/**
 * Tafuta video YouTube kwa kutumia API key
 * @param {string} query - Jina la video/movie
 * @param {string} type - "video" | "trailer"
 */
async function searchYouTube(query, type = "video") {
  const searchQuery = type === "trailer" ? `${query} official trailer` : query;

  const searchRes = await axios.get(YT_SEARCH_URL, {
    params: {
      part: "snippet",
      q: searchQuery,
      type: "video",
      maxResults: 1,
      key: YT_API_KEY,
    },
    timeout: 10000,
  });

  const item = searchRes.data.items?.[0];
  if (!item) return null;

  const videoId = item.id.videoId;
  const snippet = item.snippet;

  // Pata duration ya video
  const detailRes = await axios.get(YT_VIDEO_URL, {
    params: {
      part: "contentDetails,statistics",
      id: videoId,
      key: YT_API_KEY,
    },
    timeout: 10000,
  });

  const details = detailRes.data.items?.[0];
  const iso = details?.contentDetails?.duration || "PT0S";
  const seconds = parseISO8601Duration(iso);

  return {
    videoId,
    title: snippet.title,
    channel: snippet.channelTitle,
    thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    seconds,
    duration: formatSeconds(seconds),
  };
}

/**
 * Download video kupitia SilvaTech
 */
async function downloadVideo(ytUrl) {
  const res = await axios.get(
    `https://api.silvatech.co.ke/download/ytmp4?url=${encodeURIComponent(ytUrl)}`,
    { timeout: 30000 }
  );

  if (!res.data?.status || !res.data?.result?.download_url)
    throw new Error("Download imeshindwa kutoka SilvaTech.");

  return res.data.result;
}

// ── Helpers za Duration ──
function parseISO8601Duration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h = 0, m = 0, s = 0] = match.map(Number);
  return h * 3600 + m * 60 + s;
}

function formatSeconds(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

module.exports = { searchYouTube, downloadVideo };
