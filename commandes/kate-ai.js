const { zokou } = require("../framework/zokou");
const os = require("os");
const { format } = require("util");

zokou({
  nomCom: "kate-ai",
  reaction: "ℹ️",
  categorie: "General"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;

  try {
    // 1. Mahesabu ya muda wa bot tangu iwake (Uptime)
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    // 2. Taarifa za Server
    const ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const ramFree = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const platform = os.platform();
    const cpuModel = os.cpus()[0].model;

    // 3. Ujumbe wa Details
    const message = `
🌟 *QIEEN-KATE AI DETAILS* 🌟

👤 *Developer:* Timnasa
🔗 *GitHub:* Undefined
🤖 *Model:* Zokou / Base64 Framework
⏳ *Uptime:* ${hours}h ${minutes}m ${seconds}s

--- 💻 *SERVER INFO* ---
📌 *Platform:* ${platform}
🧠 *RAM:* ${ramTotal} GB
📉 *Free RAM:* ${ramFree} GB
⚙️ *Processor:* ${cpuModel}

--- 🛠️ *CAPABILITIES* ---
✅ AI Voice/Text Chat
✅ Media Downloader (TikTok, FB, IG)
✅ Contact Scraper (Getall)
✅ Status/Media Saver

> *Powered by 𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇*
`.trim();

    // 4. Tuma ujumbe ukiwa na picha/metadata
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        externalAdReply: {
          title: "BOT SYSTEM DETAILS",
          body: "Click to visit Developer's GitHub",
          thumbnailUrl: "https://files.catbox.moe/sez5vx.jpg",
          sourceUrl: "",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: ms });

  } catch (e) {
    repondre(`❌ Error: ${e.message}`);
  }
});
