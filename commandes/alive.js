
const { zokou } = require(__dirname + "/../framework/zokou");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");

zokou({
    nomCom: "alive",
    categorie: "General",
    reaction: "⚡"
},
async (dest, zk, commandeOptions) => {
    const { ms, auteurMessage, repondre } = commandeOptions;

    // 1. Calculate Latency (Speed)
    const start = Date.now();
    const end = Date.now();
    const latency = end - start;

    // 2. Uptime details
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    // 3. Tanzania Time (EAT)
    moment.tz.setDefault('Africa/Dar_es_Salaam');
    const currentTime = moment().format('HH:mm:ss');

    // 4. Random selection from 3 Images
    const myPictures = [
        "https://o.uguu.se/alLgUEwf.jpg",
    ];
    const randomPic = myPictures[Math.floor(Math.random() * myPictures.length)];

    // 5. English Speed Message
    const speedMsg = `*Queen-KATE ɪs ᴏɴʟɪɴᴇ* ⚡

*Hi @${auteurMessage.split("@")[0]}*
The bot is active and responding!

━━━━━━━━━━━━━━━━━━━━━
🚀 *SPEED:* ${latency} ms
🌟 *OWNER:* ${s.OWNER_NAME || "𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇"}
🕒 *TIME:* ${currentTime} EAT
⌛ *UPTIME:* ${hours}h ${minutes}m ${seconds}s
🖥️ *PLATFORM:* ${os.platform()}
🛰️ *RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} GB
━━━━━━━━━━━━━━━━━━━━━

_Type .menu to view all commands_`;

    try {
        // Send Image with English context
        await zk.sendMessage(dest, { 
            image: { url: randomPic },
            caption: speedMsg,
            mentions: [auteurMessage],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "Queen-KATE SYSTEM TEST",
                    body: "Status: Online & Stable",
                    thumbnailUrl: randomPic,
                    sourceUrl: "https://whatsapp.com/channel/120363295141350550@newsletter",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: ms });

        // 6. Send Music/Audio
        await zk.sendMessage(dest, {
            audio: { url: "https://files.catbox.moe/n5djb5.mp3" },
            mimetype: 'audio/mp4',
            ptt: false 
        }, { quoted: ms });

    } catch (e) {
        console.log("Speed Error: " + e);
        repondre("An error occurred: " + e.message);
    }
});
