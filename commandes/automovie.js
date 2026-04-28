const axios = require("axios");
const conf = require("../set");

const YT_API_KEY = "AIzaSyDpz0xO4VU4mizNPaDvZWPE_AydwV5TNkU";
const TMDB_KEY = conf.TMDB_KEY || "38f19ae1";
const CHANNEL_JID = "120363295141350550@newsletter";
const APP_URL = "https://afripay.ct.ws";
const INTERVAL_MS = 15 * 60 * 1000; // Dakika 15

const contextBase = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: CHANNEL_JID,
    newsletterName: "QUEEN-KATE AI",
    serverMessageId: 143,
  },
};

// ── Movies zilizotumwa ──
const sentMovieIds = new Set();

// ── Pata Movies Mpya kutoka TMDB ──
async function getLatestMovies() {
  const res = await axios.get("https://api.themoviedb.org/3/trending/all/week", {
    params: { api_key: TMDB_KEY, language: "en-US" },
    timeout: 10000,
  });
  return res.data.results ?? [];
}

// ── Chagua Movie Mpya ──
async function pickNewMovie() {
  const movies = await getLatestMovies();
  for (const movie of movies) {
    if (!sentMovieIds.has(movie.id)) {
      sentMovieIds.add(movie.id);
      return movie;
    }
  }
  sentMovieIds.clear();
  const first = movies[0];
  sentMovieIds.add(first.id);
  return first;
}

// ── Tafuta Trailer YouTube ──
async function searchTrailer(movieName) {
  const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
    params: {
      part: "snippet",
      q: `${movieName} official trailer`,
      type: "video",
      maxResults: 1,
      key: YT_API_KEY,
    },
    timeout: 10000,
  });
  const item = res.data.items?.[0];
  if (!item) return null;
  return `https://www.youtube.com/watch?v=${item.id.videoId}`;
}

// ── Tuma Movie kwenye Channel ──
async function postMovieToChannel(sock) {
  try {
    // STEP 1: Pata movie mpya
    const movie = await pickNewMovie();
    const title = movie.title ?? movie.name ?? "Unknown";
    const overview = movie.overview?.slice(0, 200) + "..." || "";
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : APP_URL;
    const rating = movie.vote_average?.toFixed(1) ?? "N/A";
    const year = (movie.release_date ?? movie.first_air_date ?? "").slice(0, 4);
    const type = movie.title ? "movie" : "tv";
    const watchLink = `${APP_URL}/watch.php?tmdb=${movie.id}&type=${type}`;

    console.log(`🎬 AutoMovie: "${title}"...`);

    // STEP 2: Pata YouTube trailer link
    const trailerUrl = await searchTrailer(title);

    // STEP 3: Tuma channel (poster + maelezo + links)
    await sock.sendMessage(CHANNEL_JID, {
      image: { url: poster },
      caption:
        `🎬 *${title.toUpperCase()}* ${year ? `(${year})` : ""}\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `⭐ *Rating:* ${rating}/10\n\n` +
        `📖 _${overview}_\n\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        (trailerUrl
          ? `🎥 *TRAILER:*\n👉 ${trailerUrl}\n\n`
          : "") +
        `📲 *TAZAMA KWENYE APP:*\n` +
        `👉 ${watchLink}\n\n` +
        `📥 *Huna App? Pakua Hapa:*\n` +
        `👉 ${APP_URL}\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `_🤖 Powered by QUEEN-KATE-AI_`,
      contextInfo: {
        ...contextBase,
        externalAdReply: {
          title: `🎬 ${title} ${year ? `(${year})` : ""}`,
          body: `⭐ ${rating}/10 | Tazama kwenye X-Stream`,
          thumbnailUrl: poster,
          sourceUrl: watchLink,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    });

    console.log(`✅ "${title}" imetumwa!`);

  } catch (err) {
    console.error("❌ AutoMovie error:", err.message);
  }
}

// ─────────────────────────────────────────
// 🚀 START COMMAND
// ─────────────────────────────────────────
let autoMovieInterval = null;

zokou({
  nomCom: "startmovie",
  aliases: ["moviestart", "automovie"],
  categorie: "Search",
  reaction: "🎬",
}, async (jid, sock, data) => {
  const { ms } = data;
  const repondre = async (text) => sock.sendMessage(jid, { text }, { quoted: ms });

  if (autoMovieInterval)
    return repondre("⚠️ AutoMovie inafanya kazi tayari!\nTumia *.stopmovie* kuisimamisha.");

  await repondre(
    "✅ *AutoMovie imeanzishwa!*\n" +
    "🎬 Movie mpya itatumwa kila dakika 15\n" +
    "📺 Kwenye channel yako automatically\n" +
    "🛑 Tumia *.stopmovie* kusimamisha."
  );

  await postMovieToChannel(sock);
  autoMovieInterval = setInterval(() => postMovieToChannel(sock), INTERVAL_MS);
});

// ─────────────────────────────────────────
// 🛑 STOP COMMAND
// ─────────────────────────────────────────
zokou({
  nomCom: "stopmovie",
  aliases: ["moviestop"],
  categorie: "Search",
  reaction: "🛑",
}, async (jid, sock, data) => {
  const { ms } = data;
  const repondre = async (text) => sock.sendMessage(jid, { text }, { quoted: ms });

  if (!autoMovieInterval)
    return repondre("⚠️ AutoMovie haifanyi kazi sasa.");

  clearInterval(autoMovieInterval);
  autoMovieInterval = null;
  await repondre("🛑 *AutoMovie imesimamishwa!*\nTumia *.startmovie* kuanza tena.");
});
