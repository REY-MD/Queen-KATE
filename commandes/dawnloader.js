const { zokou } = require("../framework/zokou");
const axios = require("axios");
const conf = require("../set");

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

 zokou(
  {
    nomCom: "play",
    aliases: ["music", "music"],
    categorie: "Media",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, arg } = commandeOptions;
    const repondreFormate = makeRepondre(zk, dest, ms);

    const q = arg.join(" ");
    if (!q) return repondreFormate("❌ Tafadhali weka jina la wimbo!\n\n📌 Mfano: *play Rema Calm Down*");

    try {
      // ── STEP 1 + 2: Search → Download → Tuma ──
      const searchUrl = `https://jerrycoder.oggyapi.workers.dev/spotify?search=${encodeURIComponent(q)}`;
      const searchRes = await axios.get(searchUrl, { timeout: 20000 });

      if (!searchRes.data?.tracks || searchRes.data.tracks.length === 0) {
        return repondreFormate("❌ Wimbo haukupatikana! Jaribu tena na jina lingine.");
      }

      const bestSong = searchRes.data.tracks[0];
      const { trackName, artist, spotifyUrl, thumbnail } = bestSong;

      const dlUrl = `https://jerrycoder.oggyapi.workers.dev/dspotify?url=${encodeURIComponent(spotifyUrl)}`;
      const dlRes = await axios.get(dlUrl, { timeout: 30000 });

      if (!dlRes.data?.status || !dlRes.data?.download_link) {
        return repondreFormate("❌ Imeshindwa kupakua wimbo. Jaribu tena!");
      }

      const dlData = dlRes.data;
      const title = dlData.title || trackName;
      const artistName = dlData.artist || artist;
      const thumb = dlData.thumbnail || thumbnail;

      await zk.sendMessage(dest, {
        audio: { url: dlData.download_link },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        contextInfo: {
          ...contextBase,
          externalAdReply: {
            title: `🎵 ${title}`,
            body: `🎤 ${artistName}`,
            thumbnailUrl: thumb || conf.URL,
            sourceUrl: spotifyUrl,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      }, { quoted: ms });

    } catch (err) {
      console.error("Play Error:", err.message);
      await repondreFormate("❌ Kuna hitilafu imetokea! Jaribu tena.\n\n🔧 Error: " + err.message);
    }
  }
);

// ─────────────────────────────────────────
// 🎬 TRAILER COMMAND
// ─────────────────────────────────────────
  zokou(
  {
    nomCom: "trailer",
    aliases: ["trl", "trailer"],
    categorie: "Search",
    reaction: "🎬",
  },
  async (jid, sock, data) => {
    const { arg, ms } = data;
    const repondre = makeRepondre(sock, jid, ms);

    if (!arg[0]) return repondre("❌ Taja jina la movie.\nMfano: *.trailer Avengers*");

    const query = arg.join(" ");

    try {
      // ── STEP 1: OMDB - Movie Info ──
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

      // ── STEP 2: TMDB - Pata Trailer YouTube Key ──
      const tmdbKey = conf.TMDB_KEY || "8265bd1679663a7ea12ac168da84d2e8";

      const tmdbRes = await axios.get(
        `https://api.themoviedb.org/3/find/${movieID}?api_key=${tmdbKey}&external_source=imdb_id`,
        { timeout: 10000 }
      );

      const tmdbMovie = tmdbRes.data.movie_results[0];
      if (!tmdbMovie) return repondre("❌ Trailer haikupatikana kwa movie hii.");

      const videosRes = await axios.get(
        `https://api.themoviedb.org/3/movie/${tmdbMovie.id}/videos?api_key=${tmdbKey}`,
        { timeout: 10000 }
      );

      const videos = videosRes.data.results;
      const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube") || videos[0];
      if (!trailer) return repondre("❌ Hakuna trailer YouTube kwa movie hii.");

      const ytUrl = `https://www.youtube.com/watch?v=${trailer.key}`;

      // ── STEP 3: Download na FALLBACK ──
      let videoUrl = null;

      // Jaribu API ya kwanza
      try {
        const dl1 = await axios.get(
          `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(ytUrl)}`,
          { timeout: 30000 }
        );
        if (dl1.data?.status && dl1.data?.data?.url) {
          videoUrl = dl1.data.data.url;
        }
      } catch (_) {}

      // Kama imeshindwa → jaribu API ya pili
      if (!videoUrl) {
        try {
          const dl2 = await axios.get(
            `https://api.davidcyriltech.my.id/download/youtube?url=${encodeURIComponent(ytUrl)}`,
            { timeout: 30000 }
          );
          if (dl2.data?.success && dl2.data?.result?.download_url) {
            videoUrl = dl2.data.result.download_url;
          }
        } catch (_) {}
      }

      if (!videoUrl) return repondre("❌ Imeshindwa kupakua trailer. Jaribu tena baadaye!");

      // ── STEP 4: Tuma Trailer ──
      await sock.sendMessage(jid, {
        video: { url: videoUrl },
        caption: `🎬 *${movie.Title}* (${movie.Year})\n\n⭐ IMDb: *${movie.imdbRating}/10*\n🎭 Genre: ${movie.Genre}\n📝 ${movie.Plot}`,
        mimetype: "video/mp4",
        contextInfo: {
          ...contextBase,
          externalAdReply: {
            title: `🎬 ${movie.Title} - Official Trailer`,
            body: `⭐ IMDb: ${movie.imdbRating}/10 | ${movie.Year}`,
            thumbnailUrl: movie.Poster !== "N/A" ? movie.Poster : conf.URL,
            sourceUrl: ytUrl,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      }, { quoted: ms });

    } catch (err) {
      console.error("Trailer error:", err.message);
      return repondre("❌ Hitilafu imetokea. Jaribu tena.");
    }
  }
);

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
    // ── SOURCE 1: lrclib.net (free, no API key) ──
    async () => {
      const res = await axios.get(
        `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`,
        { timeout: 10000 }
      );
      const results = res.data;
      if (!results || results.length === 0) throw new Error("lrclib no results");
      const best = results.find(r => r.plainLyrics) || results[0];
      if (!best?.plainLyrics) throw new Error("lrclib no lyrics");
      return {
        title: best.trackName || query,
        author: best.artistName || "Unknown",
        lyrics: best.plainLyrics,
        thumbnail: conf.URL,
        link: "",
      };
    },

    // ── SOURCE 2: Genius API (reliable sana) ──
    async () => {
      const geniusKey = conf.GENIUS_KEY || ""; // weka key yako hapa
      if (!geniusKey) throw new Error("No Genius key");
      const searchRes = await axios.get(
        `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${geniusKey}` },
          timeout: 10000,
        }
      );
      const hit = searchRes.data?.response?.hits?.[0]?.result;
      if (!hit) throw new Error("Genius no results");

      // Scrape lyrics from Genius page
      const pageRes = await axios.get(hit.url, { timeout: 15000 });
      const html = pageRes.data;
      const lyricsMatch = html.match(/data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/g);
      if (!lyricsMatch) throw new Error("Genius scrape failed");
      const rawLyrics = lyricsMatch
        .join("\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .trim();

      return {
        title: hit.title || query,
        author: hit.primary_artist?.name || "Unknown",
        lyrics: rawLyrics,
        thumbnail: hit.song_art_image_url || conf.URL,
        link: hit.url || "",
      };
    },

    // ── SOURCE 3: some-random-api (fallback) ──
    async () => {
      const res = await axios.get(
        `https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`,
        { timeout: 10000 }
      );
      if (!res.data?.lyrics) throw new Error("some-random-api failed");
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
      if (d?.lyrics) { lyricsData = d; break; }
    } catch (err) {
      console.log("Lyrics source failed:", err.message);
    }
  }

  if (!lyricsData)
    return repondre("❌ Lyrics haikupatikana. Jaribu jina tofauti.");

  const { title, author, lyrics, thumbnail, link } = lyricsData;

  // Gawanya lyrics kama ni ndefu sana
  const maxLen = 3500;
  const parts = [];
  let text = lyrics;
  while (text.length > maxLen) {
    parts.push(text.slice(0, maxLen));
    text = text.slice(maxLen);
  }
  parts.push(text);

  const caption = `🎵 *${title}*\n👤 *${author}*\n\n${parts[0]}`;

  await sock.sendMessage(jid, {
    image: { url: thumbnail },
    caption,
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

  // Tuma sehemu zilizobaki kama lyrics ni ndefu
  for (let i = 1; i < parts.length; i++) {
    await sock.sendMessage(jid, {
      text: parts[i],
      contextInfo: { ...contextBase },
    }, { quoted: ms });
  }
});
