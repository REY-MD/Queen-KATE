"use strict";

const { zokou } = require("../framework/zokou");
const conf = require("../set");

zokou({
    nomCom: "profile",
    categorie: "General",
    reaction: "👤"
}, async (dest, zk, commandeOptions) => {
    const { ms, arg, repondre, auteurMessage, nomAuteurMessage, msgRepondu, auteurMsgRepondu } = commandeOptions;
    const channelJid = "120363295141350550@newsletter";

    try {
        // Determine the target user (either the sender or the person replied to)
        let jid = msgRepondu ? auteurMsgRepondu : auteurMessage;
        let name = msgRepondu ? "@" + jid.split("@")[0] : nomAuteurMessage;

        // Fetch Profile Picture
        let ppUrl;
        try {
            ppUrl = await zk.profilePictureUrl(jid, 'image');
        } catch {
            ppUrl = conf.IMAGE_MENU || "https://o.uguu.se/alLgUEwf.jpg"; // Fallback image
        }

        // Fetch Bio/Status
        let status;
        try {
            const statusObj = await zk.fetchStatus(jid);
            status = statusObj.status || "No Status Available";
        } catch {
            status = "Privacy Protected 🔒";
        }

        // Professional Profile Caption
        let profileInfo = `*👤 𝚄𝚂𝙴𝚁 𝙿𝚁𝙾𝙵𝙸𝙻𝙴*\n\n`;
        profileInfo += `*🏷️ Name:* ${name}\n`;
        profileInfo += `*🆔 JID:* ${jid.split('@')[0]}\n`;
        profileInfo += `*📜 Bio:* ${status}\n`;
        profileInfo += `*🔗 Link:* wa.me/${jid.split('@')[0]}\n\n`;
        profileInfo += `*𝙱𝚢 QUEEN-KATE AI*`;

        await zk.sendMessage(dest, {
            image: { url: ppUrl },
            caption: profileInfo,
            mentions: [jid],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: channelJid,
                    newsletterName: "𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇",
                    serverMessageId: 1
                },
                externalAdReply: {
                    title: `𝙿𝚁𝙾𝙵𝙸𝙻𝙴: ${name}`,
                    body: "User Identity Details",
                    thumbnailUrl: ppUrl,
                    sourceUrl: "https://whatsapp.com/channel/0029VaeRrcnADTOKzivM0S1r",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: ms });

    } catch (error) {
        console.error("Profile Command Error:", error);
        repondre("🥵 I failed to retrieve the profile details. The user might have strict privacy settings.");
    }
});
