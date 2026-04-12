"use strict";

const { zokou } = require("../framework/zokou");

zokou({
    nomCom: "test",
    categorie: "General",
    reaction: "🚀"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;
    const channelJid = "120363295141350550@newsletter";
    const audioUrl = "https://files.catbox.moe/n5djb5.mp3";
    
    // Media Links
    const imageUrl1 = "https://o.uguu.se/alLgUEwf.jpg"; 
    const imageUrl2 = ""; 

    try {
        const testMsg = `*QUEEN-KATE AI IS RUNNING* ⚡\n\n` +
            `*Status:* 𝙾𝙽𝙻𝙸𝙽𝙴\n` +
            `*Engine:* 𝐙𝐄𝐙𝐄-𝐌𝐃\n` +
            `*Owner:* 𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇\n` +
            `*Timestamp:* ${new Date().toLocaleString()}\n\n` +
            `_System is running smoothly with media support._`;

        // 1. Send First Image with Caption
        await zk.sendMessage(dest, {
            image: { url: imageUrl1 },
            caption: testMsg,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: channelJid,
                    newsletterName: "𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇",
                    serverMessageId: 1
                }
            }
        }, { quoted: ms });

        // 2. Send Second Image
        await zk.sendMessage(dest, {
            image: { url: imageUrl2 },
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: channelJid,
                    newsletterName: "𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇"
                }
            }
        }, { quoted: ms });

        // 3. Send Audio (FIXED: Added the missing closing quote for mimetype)
        await zk.sendMessage(dest, {
            audio: { url: audioUrl },
            mimetype: 'audio/mp4',
            ptt: true,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: channelJid,
                    newsletterName: "𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇"
                }
            }
        }, { quoted: ms });

    } catch (error) {
        console.error("Test Command Error:", error);
        repondre("❌ Error: " + error.message);
    }
});
