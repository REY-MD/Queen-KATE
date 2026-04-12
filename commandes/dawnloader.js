const { zokou } = require("../framework/zokou");
const axios = require("axios");
const ytSearch = require("yt-search");
const conf = require("../set");

const contextBase = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363295141350550@newsletter",
    newsletterName: "𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇",
    serverMessageId: 143,
  },
};

const makeRepondre = (sock, jid, ms, extraContext = {}) => async (text) => {
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
        ...extraContext,
      },
    },
  }, { quoted: ms });
};

// ─────────────────────────────────────────
// 🎬 MOVIE COMMAND
// ─────────────────────────────────────────
zokou({
  nomCom: "movie",
  aliases: ["gtmovie", "mvdl"],
  categorie: "Search",
  reaction: "🎬",
}, async (jid, sock, data) => {
  const { arg, ms } = data;
  const repondre = makeRepondre(sock, jid, ms);

  if (!arg[0]) return repondre("❌ Taja jina la movie.\nMfano: .movie Avengers");

  const query = arg.join(" ");
  await repondre("🔍 Inatafuta movie...");

  try {
    const apiKey = conf.OMDB_KEY || "38f19ae1";
    const searchRes = await axios.get(`http://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`);
    
    if (searchRes.data.Response === "False") 
      return repondre(`❌ Movie haikupatikana: ${searchRes.data.Error}`);

    const movieID = searchRes.data.Search[0].imdbID;
    const detailsRes = await axios.get(`http://www.omdbapi.com/?i=${movieID}&apikey=${apiKey}`);
    const movie = detailsRes.data;

    if (movie.Response === "False") 
      return repondre(`❌ Error: ${movie.Error}`);

    const caption = `🎬 *${movie.Title}* (${movie.Year})
⭐ *IMDb:* ${movie.imdbRating}/10
🎭 *Genre:* ${movie.Genre}
🎥 *Director:* ${movie.Director}
👥 *Actors:* ${movie.Actors}
⏱️ *Runtime:* ${movie.Runtime}
🌍 *Country:* ${movie.Country}

📖 *Plot:* ${movie.Plot}`;

    await sock.sendMessage(jid, {
      image: { url: movie.Poster !== "N/A" ? movie.Poster : conf.URL },
      caption,
      contextInfo: {
        ...contextBase,
        externalAdReply: {
          title: movie.Title,
          body: `IMDb: ${movie.imdbRating}/10`,
          thumbnailUrl: movie.Poster !== "N/A" ? movie.Poster : conf.URL,
          sourceUrl: `https://www.imdb.com/title/${movie.imdbID}`,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: ms });

  } catch (err) {
    console.error("Movie error:", err);
    return repondre("❌ Hitilafu imetokea. Jaribu tena.");
  }
});

// ─────────────────────────────────────────
// 🎥 VIDEO COMMAND
// ─────────────────────────────────────────
zokou({
  nomCom: "video",
  aliases: ["ytvideo", "ytmp4", "moviedl"],
  categorie: "Search",
  reaction: "🎬",
}, async (jid, sock, data) => {
  const { arg, ms } = data;
  const repondre = makeRepondre(sock, jid, ms);

  if (!arg[0]) return repondre("❌ Taja jina la video.\nMfano: .video Rema Calm Down");

  const query = arg.join(" ");

  try {
    const results = await ytSearch(query);
    if (!results || !results.videos.length) 
      return repondre("❌ Video haikupatikana.");

    const video = results.videos[0];
    const videoUrl = video.url;

    await repondre(`🔍 Inadownload: *${video.title}*\nSubiri kidogo...`);

    // APIs za kujaribu
    const apiUrls = [
      `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`,
      `https://www.dark-yasiya-api.site/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
      `https://api.dreaded.site/api/ytdl/video?query=${encodeURIComponent(videoUrl)}`,
    ];

    let downloadUrl = null;
    let title = video.title;

    for (let url of apiUrls) {
      try {
        const res = await axios.get(url, { timeout: 15000 });
        const data = res.data;
        const link = data?.result?.download_url || data?.result?.link || data?.link || data?.url;
        if (link) {
          downloadUrl = link;
          title = data?.result?.title || data?.title || title;
          break;
        }
      } catch (e) {
        console.log("API failed:", e.message);
      }
    }

    if (!downloadUrl) return repondre("❌ Download imeshindwa. APIs zote zimefail. Jaribu baadaye.");

    await sock.sendMessage(jid, {
      video: { url: downloadUrl },
      caption: `🎬 *${title}*\n\n_Powered by QUEEN-KATE-AI_`,
      mimetype: "video/mp4",
      contextInfo: {
        ...contextBase,
        externalAdReply: {
          title: title,
          body: "QUEEN-KATE-AI Video Downloader",
          thumbnailUrl: video.thumbnail,
          sourceUrl: videoUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: ms });

  } catch (err) {
    console.error("Video error:", err);
    return repondre("❌ Download imeshindwa: " + (err.message || err));
  }
});

// ─────────────────────────────────────────
// 📝 LYRICS COMMAND
// ─────────────────────────────────────────
zokou({
  nomCom: "lyrics",
  aliases: ["ly", "songlyrics", "lyric"],
  categorie: "Search",
  reaction: "📝",
}, async (jid, sock, data) => {
  const { arg, ms } = data;
  const repondre = makeRepondre(sock, jid, ms);

  if (!arg[0]) return repondre("❌ Taja jina la wimbo.\nMfano: .lyrics Rema Calm Down");

  const query = arg.join(" ");
  await repondre("🔍 Inatafuta lyrics...");

  const sources = [
    async () => {
      const res = await axios.get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(query)}`, { timeout: 10000 });
      if (!res.data?.lyrics) throw new Error("No lyrics");
      return {
        title: res.data.title || query,
        author: res.data.artist || "Unknown",
        lyrics: res.data.lyrics,
        thumbnail: res.data.image || conf.URL,
      };
    },
    async () => {
      const res = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(query)}`, { timeout: 10000 });
      if (!res.data?.content) throw new Error("No lyrics");
      return {
        title: res.data.title || query,
        author: res.data.artist || "Unknown",
        lyrics: res.data.content,
        thumbnail: res.data.image || conf.URL,
      };
    },
    async () => {
      const res = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`, { timeout: 10000 });
      if (!res.data?.lyrics) throw new Error("No lyrics");
      return {
        title: res.data.title || query,
        author: res.data.author || "Unknown",
        lyrics: res.data.lyrics,
        thumbnail: res.data.thumbnail?.genius || conf.URL,
      };
    },
  ];

  let lyricsData = null;
  for (const fetchLyrics of sources) {
    try {
      lyricsData = await fetchLyrics();
      if (lyricsData?.lyrics) break;
    } catch (e) {
      console.log("Lyrics source failed:", e.message);
    }
  }

  if (!lyricsData) return repondre("❌ Lyrics haikupatikana. Jaribu jina tofauti.");

  const { title, author, lyrics, thumbnail } = lyricsData;
  const message = `🎵 *${title}*\n👤 *${author}*\n\n${lyrics.slice(0, 4000)}`;

  await sock.sendMessage(jid, {
    image: { url: thumbnail },
    caption: message,
    contextInfo: {
      ...contextBase,
      externalAdReply: {
        title: title,
        body: `By ${author}`,
        thumbnailUrl: thumbnail,
        mediaType: 1,
        renderLargerThumbnail: false,
      },
    },
  }, { quoted: ms });
});

// ─────────────────────────────────────────
// 🎵 PLAY / AUDIO COMMAND
// ─────────────────────────────────────────
zokou({
  nomCom: "play",
  aliases: ["song", "ytmp3", "audio", "mp3"],
  categorie: "Search",
  reaction: "🎵",
}, async (jid, sock, data) => {
  const { arg, ms } = data;
  const repondre = makeRepondre(sock, jid, ms);

  if (!arg[0]) return repondre("❌ Taja jina la wimbo.\nMfano: .play Rema Calm Down");

  const query = arg.join(" ");

  try {
    const results = await ytSearch(query);
    if (!results || !results.videos.length) 
      return repondre("❌ Wimbo haukupatikana.");

    const video = results.videos[0];
    const videoUrl = video.url;
    const [artist, songTitle] = video.title.includes(" - ")
      ? video.title.split(" - ", 2)
      : ["Unknown Artist", video.title];

    await repondre(`🎵 Inadownload: *${video.title}*\nSubiri...`);

    // APIs za audio
    const audioApis = [
      `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`,
      `https://api.dreaded.site/api/ytdl/mp3?query=${encodeURIComponent(videoUrl)}`,
      `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
    ];

    let downloadUrl = null;
    let thumbnail = video.thumbnail;

    for (let url of audioApis) {
      try {
        const res = await axios.get(url, { timeout: 20000 });
        const d = res.data;
        const link = d?.result?.download_url || d?.result?.link || d?.link || d?.url;
        if (link) {
          downloadUrl = link;
          thumbnail = d?.result?.thumbnail || d?.thumbnail || thumbnail;
          break;
        }
      } catch (e) {
        console.log("Audio API failed:", e.message);
      }
    }

    if (!downloadUrl) return repondre("❌ Download imeshindwa. APIs zote zimefail. Jaribu baadaye.");

    await sock.sendMessage(jid, {
      audio: { url: downloadUrl },
      mimetype: "audio/mp4",
      contextInfo: {
        ...contextBase,
        externalAdReply: {
          title: "🎵 QUEEN-KATE-AI AUDIO",
          body: `${artist} - ${songTitle}`,
          thumbnailUrl: thumbnail,
          sourceUrl: videoUrl,
          mediaType: 1,
          renderLargerThumbnail: false,
        },
      },
    }, { quoted: ms });

  } catch (err) {
    console.error("Play error:", err);
    return repondre("❌ Download imeshindwa: " + (err.message || err));
  }
});
