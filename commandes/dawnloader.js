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
    aliases: ["music", "song"],
    categorie: "Media",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, nomAuteurMessage } = commandeOptions;
    const repondreFormate = makeRepondre(zk, dest, ms);

    const q = arg.join(" ");
    if (!q) return repondreFormate("❌ Tafadhali weka jina la wimbo!\n\n📌 Mfano: *play Rema Calm Down*");

    await repondreFormate("🔍 Inatafuta wimbo... Subiri kidogo!");

    try {
      // ── STEP 1: Search Spotify ──
      const searchUrl = `https://jerrycoder.oggyapi.workers.dev/spotify?search=${encodeURIComponent(q)}`;
      const searchRes = await axios.get(searchUrl);
      const data = searchRes.data;

      if (!data || !data.results || data.results.length === 0) {
        return repondreFormate("❌ Wimbo haukupatikana! Jaribu tena na jina lingine.");
      }

      const bestSong = data.results[0];
      const { title, artist, duration, spotifyUrl, thumbnail } = bestSong;

      await repondreFormate(
        `🎵 *Wimechagua Wimbo:*\n\n` +
        `📀 *Jina:* ${title}\n` +
        `🎤 *Msanii:* ${artist}\n` +
        `⏱️ *Muda:* ${duration}\n\n` +
        `⬇️ Inapakua... Subiri!`
      );

      // ── STEP 2: Download ──
      const downloadUrl = `https://jerrycoder.oggyapi.workers.dev/dspotify?url=${encodeURIComponent(spotifyUrl)}`;
      const dlRes = await axios.get(downloadUrl);
      const dlData = dlRes.data;

      if (!dlData || !dlData.downloadUrl) {
        return repondreFormate("❌ Imeshindwa kupakua wimbo. Jaribu tena!");
      }

      // ── STEP 3: Tuma Audio ──
      await zk.sendMessage(dest, {
        audio: { url: dlData.downloadUrl },
        mimetype: "audio/mpeg",
        ptt: false,
        fileName: `${title} - ${artist}.mp3`,
        contextInfo: {
          ...contextBase,
          externalAdReply: {
            title: `🎵 ${title}`,
            body: `🎤 ${artist} | ⏱️ ${duration}`,
            thumbnailUrl: thumbnail || conf.URL,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      }, { quoted: ms });

    } catch (err) {
      console.error("Play Error:", err.message);
      await repondreFormate("❌ Kuna hitilafu imetokea! Jaribu tena baadaye.\n\n🔧 Error: " + err.message);
    }
  }
);

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

    // ── STEP 2: TMDB - Pata Trailer ──
    const tmdbKey = conf.TMDB_KEY || "8265bd1679663a7ea12ac168da84d2e8";
    let trailerUrl = null;
    let trailerVideoUrl = null;

    try {
      // Tafuta movie kwenye TMDB kutumia IMDB ID
      const tmdbRes = await axios.get(
        `https://api.themoviedb.org/3/find/${movieID}?api_key=${tmdbKey}&external_source=imdb_id`,
        { timeout: 10000 }
      );

      const tmdbMovie = tmdbRes.data.movie_results[0];

      if (tmdbMovie) {
        // Pata trailer videos
        const videosRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${tmdbMovie.id}/videos?api_key=${tmdbKey}`,
          { timeout: 10000 }
        );

        const videos = videosRes.data.results;
        const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube")
                     || videos[0];

        if (trailer) {
          trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
          // Tumia yt-dlp-web au invidious kupata direct video link
          trailerVideoUrl = `https://inv.tux.pizza/latest_version?id=${trailer.key}&itag=18`;
        }
      }
    } catch (trailerErr) {
      console.log("Trailer fetch failed:", trailerErr.message);
    }

    // ── STEP 3: Tuma Movie Info + Poster ──
    const caption = `🎬 *${movie.Title}* (${movie.Year})
⭐ *IMDb:* ${movie.imdbRating}/10
🎭 *Genre:* ${movie.Genre}
🎥 *Director:* ${movie.Director}
👥 *Actors:* ${movie.Actors}
⏱️ *Runtime:* ${movie.Runtime}
🌍 *Country:* ${movie.Country}

📖 *Plot:* ${movie.Plot}

${trailerUrl ? `🎞️ *Trailer:* ${trailerUrl}` : ""}`;

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

    // ── STEP 4: Tuma Trailer Video (kama inapatikana) ──
    if (trailerVideoUrl) {
      await repondre("🎞️ Inapakua trailer... Subiri kidogo!");
      await sock.sendMessage(jid, {
        video: { url: trailerVideoUrl },
        caption: `🎬 *${movie.Title}* - Official Trailer`,
        mimetype: "video/mp4",
        contextInfo: {
          ...contextBase,
          externalAdReply: {
            title: `🎬 ${movie.Title} - Trailer`,
            body: `IMDb: ${movie.imdbRating}/10`,
            thumbnailUrl: movie.Poster !== "N/A" ? movie.Poster : conf.URL,
            sourceUrl: trailerUrl,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      }, { quoted: ms });
    }

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
