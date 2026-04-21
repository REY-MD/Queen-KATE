const axios = require("axios");
const conf = require("../set");
const { searchYouTube, downloadVideo } = require("./lib/ytHelper");
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

    // ── STEP 1: Tafuta Trailer YouTube ──
    const video = await searchYouTube(query, "trailer");
    if (!video) return repondre("❌ Trailer haikupatikana YouTube.");

    await repondre("📥 _Inadownload trailer, subiri..._");

    // ── STEP 2: Download ──
    const result = await downloadVideo(video.url);

    // ── STEP 3: Tuma Trailer ──
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
