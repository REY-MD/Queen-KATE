const { zokou } = require("../framework/zokou");
const axios = require("axios");
const conf = require("../set");

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
      await repondre("🔍 Inatafuta trailer, subiri...");

      // ── STEP 1: OMDB - Movie Info ──
      const omdbKey = conf.OMDB_KEY || "38f19ae1";
      const searchRes = await axios.get(
        `http://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${omdbKey}`,
        { timeout: 10000 }
      );

      if (searchRes.data.Response === "False")
        return repondre(`❌ Movie haikupatikana: ${searchRes.data.Error}`);

      const movieID = searchRes.data.Search[0].imdbID;
      const detailsRes = await axios.get(
        `http://www.omdbapi.com/?i=${movieID}&apikey=${omdbKey}`,
        { timeout: 10000 }
      );
      const movie = detailsRes.data;

      if (movie.Response === "False")
        return repondre(`❌ Error: ${movie.Error}`);

      // ── STEP 2: TMDB - Pata YouTube Trailer Key ──
      const tmdbKey = conf.TMDB_KEY || "AIzaSyDpz0xO4VU4mizNPaDvZWPE_AydwV5TNkU";
      const tmdbRes = await axios.get(
        `https://api.themoviedb.org/3/find/${movieID}?api_key=${tmdbKey}&external_source=imdb_id`,
        { timeout: 10000 }
      );

      const tmdbMovie = tmdbRes.data.movie_results[0];
      if (!tmdbMovie) return repondre("❌ Movie haikupatikana TMDB.");

      const videosRes = await axios.get(
        `https://api.themoviedb.org/3/movie/${tmdbMovie.id}/videos?api_key=${tmdbKey}`,
        { timeout: 10000 }
      );

      const trailer =
        videosRes.data.results.find(v => v.type === "Trailer" && v.site === "YouTube") ||
        videosRes.data.results.find(v => v.type === "Teaser" && v.site === "YouTube");

      if (!trailer) return repondre("❌ Hakuna trailer YouTube kwa movie hii.");

      const ytUrl = `https://www.youtube.com/watch?v=${trailer.key}`;

      await repondre("📥 Inapakua trailer...");

      // ── STEP 3: SilvaTech API - Download ──
      const apiRes = await axios.get(
        `https://api.silvatech.co.ke/download/ytmp4?url=${encodeURIComponent(ytUrl)}`,
        { timeout: 30000 }
      );

      if (!apiRes.data?.status || !apiRes.data?.result?.download_url)
        return repondre("❌ Download imeshindwa. Jaribu tena baadaye.");

      const result = apiRes.data.result;

      const plot =
        movie.Plot?.length > 200 ? movie.Plot.slice(0, 197) + "..." : movie.Plot;

      // ── STEP 4: Tuma Trailer ──
      await sock.sendMessage(jid, {
        video: { url: result.download_url },
        caption:
          `🎬 *${movie.Title}* (${movie.Year})\n\n` +
          `⭐ IMDb: *${movie.imdbRating}/10*\n` +
          `🎭 Genre: ${movie.Genre}\n` +
          `🌍 Country: ${movie.Country}\n` +
          `⏱️ Runtime: ${movie.Runtime}\n` +
          `📝 ${plot}\n\n` +
          `🔗 ${ytUrl}`,
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
      return repondre("❌ Hitilafu imetokea: " + err.message);
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
    return repondre("❌ Taja jina la video.\nMfano: *.video Rema Calm Down*");

  const query = arg.join(" ");

  try {
    // ── STEP 1: Tafuta YouTube ──
    const results = await ytSearch(query);
    if (!results?.videos?.length)
      return repondre("❌ Video haikupatikana YouTube.");

    const video = results.videos[0];
    const videoUrl = video.url;

    // ── STEP 2: Tuma ujumbe wa kusubiri ──
    await sock.sendMessage(jid, {
      text: "```📥 Inadownload video, subiri...```",
      contextInfo: {
        ...contextBase,
        externalAdReply: {
          title: video.title,
          body: "⏳ Inaprocess...",
          thumbnailUrl: video.thumbnail,
          sourceUrl: videoUrl,
          mediaType: 1,
          renderLargerThumbnail: false,
        },
      },
    }, { quoted: ms });

    // ── STEP 3: SilvaTech API ──
    const apiRes = await axios.get(
      `https://api.silvatech.co.ke/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
      { timeout: 30000 }
    );

    if (!apiRes.data?.status || !apiRes.data?.result?.download_url)
      return repondre("❌ Download imeshindwa. Jaribu tena baadaye.");

    const result = apiRes.data.result;

    // ── STEP 4: Tuma Video ──
    await sock.sendMessage(jid, {
      video: { url: result.download_url },
      caption:
        `🎬 *${result.title}*\n\n` +
        `📺 Channel: ${result.channel}\n` +
        `_Powered by QUEEN-KATE-AI_`,
      mimetype: "video/mp4",
      contextInfo: {
        ...contextBase,
        externalAdReply: {
          title: result.title,
          body: `📺 ${result.channel} | YouTube`,
          mediaType: 1,
          showAdAttribution: false,
          thumbnailUrl: result.thumbnail,
          sourceUrl: result.watch_url || videoUrl,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: ms });

  } catch (err) {
    console.error("Video error:", err.message);
    return repondre("❌ Video download imeshindwa: " + err.message);
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
