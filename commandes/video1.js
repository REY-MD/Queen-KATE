zokou(
  {
    nomCom: "video1",
    aliases: ["vid", "mv"],
    categorie: "Media",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, arg } = commandeOptions;
    const repondreFormate = makeRepondre(zk, dest, ms);

    const q = arg.join(" ");
    if (!q) return repondreFormate("❌ Tafadhali weka jina la wimbo!\n\n📌 Mfano: *video Rema Calm Down*");

    try {
      // ── STEP 1: Spotify Search → pata jina sahihi ──
      const searchRes = await axios.get(
        `https://jerrycoder.oggyapi.workers.dev/spotify?search=${encodeURIComponent(q)}`,
        { timeout: 20000 }
      );

      if (!searchRes.data?.tracks || searchRes.data.tracks.length === 0) {
        return repondreFormate("❌ Wimbo haukupatikana! Jaribu tena na jina lingine.");
      }

      const bestSong = searchRes.data.tracks[0];
      const { trackName, artist, thumbnail } = bestSong;
      const searchQuery = `${trackName} ${artist} official video`;

      // ── STEP 2: YouTube Search ──
      const ytSearchRes = await axios.get(
        `https://api.siputzx.my.id/api/s/youtube?q=${encodeURIComponent(searchQuery)}`,
        { timeout: 20000 }
      );

      const ytResults = ytSearchRes.data?.data;
      if (!ytResults || ytResults.length === 0) {
        return repondreFormate("❌ Video haikupatikana YouTube! Jaribu tena.");
      }

      const ytVideo = ytResults[0];
      const ytUrl = ytVideo.url;

      // ── STEP 3: Download Video ──
      const dlRes = await axios.get(
        `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(ytUrl)}`,
        { timeout: 60000 }
      );

      if (!dlRes.data?.status || !dlRes.data?.data?.url) {
        return repondreFormate("❌ Imeshindwa kupakua video. Jaribu tena!");
      }

      const videoUrl = dlRes.data.data.url;

      // ── STEP 4: Tuma Video ──
      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        caption: `🎵 *${trackName}*\n🎤 *${artist}*`,
        contextInfo: {
          ...contextBase,
          externalAdReply: {
            title: `🎬 ${trackName}`,
            body: `🎤 ${artist}`,
            thumbnailUrl: thumbnail || conf.URL,
            sourceUrl: ytUrl,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      }, { quoted: ms });

    } catch (err) {
      console.error("Video Error:", err.message);
      await repondreFormate("❌ Kuna hitilafu imetokea! Jaribu tena.\n\n🔧 Error: " + err.message);
    }
  }
);
