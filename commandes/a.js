const axios = require("axios");
const conf = require("../set");

const YT_API_KEY = "AIzaSyDpz0xO4VU4mizNPaDvZWPE_AydwV5TNkU";

const contextBase = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363295141350550@newsletter",
    newsletterName: "QUEEN-KATE AI",
    serverMessageId: 143,
  },
};

const makeRepondre = (sock, jid, ms) => async (text) => {
  await sock.sendMessage(jid, {
    text,
    contextInfo: {
      ...contextBase,
      externalAdReply: {
        title: "QUEEN-KATE-AI",
        body: "Powered by 𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇",
        thumbnailUrl: conf.URL,
        mediaType: 1,
        renderLargerThumbnail: false,
      },
    },
  }, { quoted: ms });
};

// ── YouTube Search Function ──
async function searchYouTube(query, type = "video") {
  const searchQuery = type === "trailer" ? `${query} official trailer` : query;

  const searchRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
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

  const detailRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
    params: { part: "contentDetails", id: videoId, key: YT_API_KEY },
    timeout: 10000,
  });

  const iso = detailRes.data.items?.[0]?.contentDetails?.duration || "PT0S";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const h = Number(match?.[1] || 0);
  const m = Number(match?.[2] || 0);
  const s = Number(match?.[3] || 0);
  const seconds = h * 3600 + m * 60 + s;
  const duration = h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;

  return {
    videoId,
    title: snippet.title,
    channel: snippet.channelTitle,
    thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    seconds,
    duration,
  };
}

// ── SilvaTech Download Function ──
async function downloadVideo(ytUrl) {
  const res = await axios.get(
    `https://api.silvatech.co.ke/download/ytmp4?url=${encodeURIComponent(ytUrl)}`,
    { timeout: 30000 }
  );
  if (!res.data?.status || !res.data?.result?.download_url)
    throw new Error("SilvaTech download imeshindwa.");
  return res.data.result;
}

// ─────────────────────────────────────────
// 🎬 TRAILER COMMAND
// ─────────────────────────────────────────
zokou({
  nomCom: "trailer",
  aliases: ["trl", "trailer"],
  categorie: "Search",
  reaction: "🎬",
}, async (jid, sock, data) => {
  const { arg, ms } = data;
  const repondre = makeRepondre(sock, jid, ms);

  if (!Array.isArray(arg) || !arg.length)
    return repondre("❌ Taja jina la movie.\nMfano: *.trailer Avengers*");

  const query = arg.join(" ");

  try {
    await repondre("🔍 _Inatafuta trailer YouTube..._");

    const video = await searchYouTube(query, "trailer");
    if (!video) return repondre("❌ Trailer haikupatikana YouTube.");

    await repondre("📥 _Inadownload trailer, subiri..._");

    const result = await downloadVideo(video.url);

    await sock.sendMessage(jid, {
      video: { url: result.download_url },
      caption:
        `🎬 *${video.title}*\n\n` +
        `📺 Channel: ${video.channel}\n` +
        `⏱️ Duration: ${video.duration}\n\n` +
        `_Powered by QUEEN-KATE-AI_`,
      mimetype: "video/mp4",
      contextInfo: {
        ...contextBase,
        externalAdReply: {
          title: video.title,
          body: `🎬 Official Trailer | YouTube`,
          thumbnailUrl: video.thumbnail,
          sourceUrl: video.url,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: ms });

  } catch (err) {
    console.error("Trailer error:", err.message);
    return repondre("❌ Imeshindwa: " + err.message);
  }
});
