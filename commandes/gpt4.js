"use strict";

const { zokou } = require("../framework/zokou");
const axios = require("axios");

zokou({ 
    nomCom: "gpt4", 
    aliases: ["ai", "gpt4", "ask"], 
    categorie: "AI", 
    reaction: "🤖" 
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, ms, prefixe, auteurMessage } = commandeOptions;
    const channelJid = "120363413554978773@newsletter";

    if (!arg || arg.length === 0) {
        return zk.sendMessage(dest, { 
            text: `*Hello @${auteurMessage.split('@')[0]}, how can I help you today?*\n\n*Example:* ${prefixe}gpt What is Quantum Physics?`,
            mentions: [auteurMessage] 
        }, { quoted: ms });
    }

    const prompt = arg.join(" ");

    try {
        // Tumia API hii ya Blackbox ambayo ni bure na imara zaidi kwa sasa
        const response = await axios.get(`https://mkzstyleee.vercel.app/ai/blackbox?text=${encodeURIComponent(prompt)}`);
        
        if (!response.data || !response.data.result) {
            throw new Error("Invalid API response");
        }

        const result = response.data.result;

        await zk.sendMessage(dest, {
            text: `*KATE GPT 4 AI*\n\n${result}\n\n*Requested by:* @${auteurMessage.split('@')[0]}`,
            mentions: [auteurMessage],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "𝙶𝙿𝚃-𝟺 𝙸𝙽𝚃𝙴𝙻𝙻𝙸𝙶𝙴𝙽𝙲𝙴",
                    body: "Powered by 𝚃𝙸𝙼𝙽𝙰𝚂𝙰-𝚃𝙼𝙳",
                    thumbnailUrl: "https://o.uguu.se/alLgUEwf.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029VaeRrcnADTOKzivM0S1r",
                    mediaType: 1,
                    renderLargerThumbnail: true // Iweke True ili picha ionekane kubwa na nzuri
                }
            }
        }, { quoted: ms });

    } catch (e) {
        console.error("GPT Error:", e.message);
        repondre("🥵 *GPT-4 is currently busy. Please try again later or check your internet connection.*");
    }
});
