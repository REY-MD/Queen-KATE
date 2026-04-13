const { zokou } = require("../framework/zokou");
const axios = require("axios");
const ytSearch = require("yt-search");
const conf = require("../set");

// ── GiftedTech API Config ──
const GiftedTechApi = "https://apis.davidcyriltech.my.id";
const GiftedApiKey = "gifted-md";

const contextBase = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363295141350550@newsletter",
    newsletterName: "𝐙𝐄𝐙𝐄𝟒𝟕-𝐌𝐃 V²",
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
        body: "Powered by 𝐙𝐄𝐙𝐄𝟒𝟕-𝐌𝐃 V²",
        thumbnailUrl: conf.URL,
        mediaType: 1,
        renderLargerThumbnail: false,
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
    const searchRes = await axios.get(
      `http://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`,
      { timeout: 10000 }
    );

    if (searchRes.data.Response === "False")
      return repondre(`❌ Movie haikupatikana: ${searchRes.data.Error}`);

    const movieID = searchRes.data.Search[0].imdbID;
    const detailsRes = await axios.get(
      `http://www.omdbapi.com/?i=${movieID}&apikey=${apiKey}`,
      { timeout: 10000 }
    );
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
  aliases: ["ytvideo", "ytmp4", "getmovie", "moviedl"],
  categorie: "Search",
  reaction: "🎬",
}, async (jid, sock, data) => {
  const { arg, ms } = data;
  const repondre = makeRepondre(sock, jid, ms);

  if (!Array.isArray(arg) || !arg.length)
    return repondre("❌ Taja jina la video.\nMfano: .video Rema Calm Down");

  const query = arg.join(" ");

  try {
    const results = await ytSearch(query);
    if (!results || !results.videos.length)
      return repondre("❌ Video haikupatikana.");

    const video = results.videos[0];
    const videoUrl = video.url;

    await sock.sendMessage(jid, {
      text: "```📥 Inadownload video...```",
      contextInfo: {
        ...contextBase,
        externalAdReply: {
          title: video.title,
          body: "Searching YouTube...",
          thumbnailUrl: video.thumbnail,
          sourceUrl: videoUrl,
          mediaType: 1,
          renderLargerThumbnail: false,
        },
      },
    }, { quoted: ms });

    // APIs za video — GiftedTech kwanza
    const videoApis = [
      `${GiftedTechApi}/api/download/ytmp4?apikey=${GiftedApiKey}&url=${encodeURIComponent(videoUrl)}`,
      `https://www.dark-yasiya-api.site/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
      `https://api.dreaded.site/api/ytdl/video?query=${encodeURIComponent(videoUrl)}`,
    ];

    let response = null;

    for (let url of videoApis) {
      try {
        console.log("Trying video API:", url);
        const res = await axios.get(url, { timeout: 20000 });
        const d = res.data;
        const link = d?.result?.download_url || d?.result?.link || d?.link || d?.url;
        if (link) {
          response = {
            title: d?.result?.title || d?.title || video.title,
            link,
            thumbnail: d?.result?.thumbnail || d?.thumbnail || video.thumbnail,
          };
          console.log("✅ Video API ikafanikiwa!");
          break;
        }
      } catch (e) {
        console.log("❌ Video API imefail:", e.message);
      }
    }

    if (!response || !response.link)
      return repondre("❌ Download imeshindwa. APIs zote zimefail. Jaribu baadaye.");

    await sock.sendMessage(jid, {
      video: { url: response.link },
      caption: `🎬 *${response.title}*\n\n_Powered by QUEEN-KATE-AI_`,
      mimetype: "video/mp4",
      contextInfo: {
        ...contextBase,
        externalAdReply: {
          title: response.title,
          body: "Tap to watch on YouTube",
          mediaType: 1,
          showAdAttribution: false,
          thumbnailUrl: response.thumbnail,
          sourceUrl: videoUrl,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: ms });

  } catch (err) {
    console.error("Video Download Error:", err);
    return repondre("❌ Video download imeshindwa: " + (err.message || err));
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

  let lyricsData = null;

  const sources = [
    async () => {
      const res = await axios.get(
        `https://api.popcat.xyz/lyrics?song=${encodeURIComponent(query)}`,
        { timeout: 10000 }
      );
      if (!res.data?.lyrics) throw new Error("Popcat failed");
      return {
        title: res.data.title || query,
        author: res.data.artist || "Unknown",
        lyrics: res.data.lyrics,
        thumbnail: res.data.image || conf.URL,
        link: res.data.url || "",
      };
    },
    async () => {
      const res = await axios.get(
        `https://lyrist.vercel.app/api/${encodeURIComponent(query)}`,
        { timeout: 10000 }
      );
      if (!res.data?.content) throw new Error("Lyrist failed");
      return {
        title: res.data.title || query,
        author: res.data.artist || "Unknown",
        lyrics: res.data.content,
        thumbnail: res.data.image || conf.URL,
        link: "",
      };
    },
    async () => {
      const res = await axios.get(
        `https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`,
        { timeout: 10000 }
      );
      if (!res.data?.lyrics) throw new Error("Some-Random-API failed");
      return {
        title: res.data.title || query,
        author: res.data.author || "Unknown",
        lyrics: res.data.lyrics,
        thumbnail: res.data.thumbnail?.genius || conf.URL,
        link: res.data.links?.genius || "",
      };
    },
  ];

  for (const fetchLyrics of sources) {
    try {
      const d = await fetchLyrics();
      if (d && d.lyrics) { lyricsData = d; break; }
    } catch (err) {
      console.log("Lyrics source failed:", err.message);
    }
  }

  if (!lyricsData)
    return repondre("❌ Lyrics haikupatikana. Jaribu jina tofauti.");

  const { title, author, lyrics, thumbnail, link } = lyricsData;
  const message = `*🎵 Title:* ${title}\n*👤 Artist:* ${author}\n\n${lyrics.slice(0, 4096)}`;

  await sock.sendMessage(jid, {
    image: { url: thumbnail },
    caption: message,
    contextInfo: {
      ...contextBase,
      externalAdReply: {
        title: title,
        body: `By ${author}`,
        mediaType: 1,
        thumbnailUrl: thumbnail,
        sourceUrl: link || "",
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
  reaction: "⬇️",
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

    await sock.sendMessage(jid, { text: "```📥 Inadownload....```" }, { quoted: ms });

    let downloadUrl = null;
    let thumbnail = video.thumbnail;

    // ── HATUA 1: GiftedTech API (ytmp3) ──
    try {
      const res = await axios.get(
        `${GiftedTechApi}/api/download/ytmp3?apikey=${GiftedApiKey}&url=${encodeURIComponent(videoUrl)}`,
        { timeout: 20000 }
      );
      const d = res.data;
      const link = d?.result?.download_url || d?.result?.link || d?.link || d?.url;
      if (link) {
        downloadUrl = link;
        thumbnail = d?.result?.thumbnail || d?.thumbnail || thumbnail;
        console.log("✅ GiftedTech MP3 ikafanikiwa!");
      }
    } catch (e) {
      console.log("❌ GiftedTech MP3 imefail:", e.message);
    }

    // ── HATUA 2: Backup APIs ──
    if (!downloadUrl) {
      const backupApis = [
        `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        `https://api.dreaded.site/api/ytdl/mp3?query=${encodeURIComponent(videoUrl)}`,
      ];

      for (let url of backupApis) {
        try {
          const res = await axios.get(url, { timeout: 20000 });
          const d = res.data;
          const link = d?.result?.download_url || d?.result?.link || d?.link || d?.url;
          if (link) {
            downloadUrl = link;
            thumbnail = d?.result?.thumbnail || d?.thumbnail || thumbnail;
            console.log("✅ Backup API ikafanikiwa:", url);
            break;
          }
        } catch (e) {
          console.log("❌ Backup API imefail:", e.message);
        }
      }
    }

    // ── HATUA 3: Spotify API ──
    if (!downloadUrl) {
      console.log("🔄 Inajaribu Spotify...");
      try {
        const spotifySearch = await axios.get(
          `https://jerrycoder.oggyapi.workers.dev/spotify?search=${encodeURIComponent(query)}`,
          { timeout: 15000 }
        );
        const bestSong =
          spotifySearch.data?.tracks?.[0] ||
          spotifySearch.data?.data?.[0] ||
          spotifySearch.data?.[0];

        if (bestSong) {
          const spotifyUrl =
            bestSong.spotifyUrl || bestSong.url || bestSong.external_urls?.spotify;

          if (spotifyUrl) {
            const sd = await axios.get(
              `https://jerrycoder.oggyapi.workers.dev/dspotify?url=${encodeURIComponent(spotifyUrl)}`,
              { timeout: 20000 }
            );
            const link = sd.data?.download_url || sd.data?.url || sd.data?.link;
            if (link) {
              downloadUrl = link;
              thumbnail = sd.data?.thumbnail || bestSong?.image || thumbnail;
              console.log("✅ Spotify API ikafanikiwa!");
            }
          }
        }
      } catch (e) {
        console.log("❌ Spotify API imefail:", e.message);
      }
    }

    // ── HATUA 4: Zote zimefail ──
    if (!downloadUrl)
      return repondre("❌ Download imeshindwa. APIs zote zimefail.\nJaribu tena baadaye au tumia jina tofauti.");

    await sock.sendMessage(jid, {
      audio: { url: downloadUrl },
      mimetype: "audio/mp4",
      contextInfo: {
        ...contextBase,
        externalAdReply: {
          title: "♻️ QUEEN-KATE-AI AUDIO DOWNLOADER ♻️",
          body: `🎵 ${artist} - ${songTitle}`,
          mediaType: 1,
          thumbnailUrl: thumbnail,
          sourceUrl: videoUrl,
          renderLargerThumbnail: false,
          showAdAttribution: false,
        },
      },
    }, { quoted: ms });

  } catch (err) {
    console.error("Download Error:", err);
    return repondre("❌ Download imeshindwa: " + (err.message || err));
  }
});
