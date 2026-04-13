const { zokou } = require('../framework/zokou');
const { addOrUpdateDataInAlive, getDataFromAlive } = require('../bdd/alive');
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");

zokou(
    {
        nomCom: 'alive',
        categorie: 'General',
        reaction: "🪴"
    },
    async (dest, zk, { ms, arg, repondre, superUser }) => {
        const data = await getDataFromAlive();
        const time = moment().tz('Etc/GMT').format('HH:mm:ss');
        const date = moment().format('DD/MM/YYYY');
        const mode = (s.MODE.toLowerCase() === "yes") ? "public" : "private";

        if (!arg || !arg[0]) {
            let aliveMsg;

            if (data) {
                const { message, lien } = data;
                aliveMsg = `KATE AI\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ *🔥 KATE AI 𝐢𝐬 𝐀𝐋𝐈𝐕𝐄, Yo!* 🔥\n│❒ *👑 𝐎𝐰𝐧𝐞𝐫*: ${s.OWNER_NAME}\n│❒ *🌐 𝐌𝐨𝐝𝐞*: ${mode}\n│❒ *📅 𝐃𝐚𝐭𝐞*: ${date}\n│❒ *⏰ 𝐓𝐢𝐦𝐞 (GMT)*: ${time}\n│❒ *💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐞*: ${message}\n│❒ *🤖 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝘡𝘌𝘡𝘌 𝘛𝘌𝘊𝘏*\n◈━━━━━━━━━━━━━━━━◈`;
                try {
                    if (lien) {
                        if (lien.match(/\.(mp4|gif)$/i)) {
                            await zk.sendMessage(dest, { 
                                video: { url: lien }, 
                                caption: aliveMsg 
                            }, { quoted: ms });
                        } else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
                            await zk.sendMessage(dest, { 
                                image: { url: lien }, 
                                caption: aliveMsg 
                            }, { quoted: ms });
                        } else {
                            repondre(aliveMsg);
                        }
                    } else {
                        repondre(aliveMsg);
                    }
                } catch (e) {
                    console.error("Error:", e);
                    repondre(`KATE AI\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ OOPS! KATE AI failed to show off: ${e.message} 😡 Try again! 😣\n◈━━━━━━━━━━━━━━━━◈`);
                }
            } else {
                aliveMsg = `KATE AI\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ *🔥 KATE AI 𝐢𝐬 𝐀𝐋𝐈𝐕𝐄, Yo!* 🔥\n│❒ *👑 𝐎𝐰𝐧𝐞𝐫*: ${s.OWNER_NAME}\n│❒ *🌐 𝐌𝐨𝐝𝐞*: ${mode}\n│❒ *📅 𝐃𝐚𝐭𝐞*: ${date}\n│❒ *⏰ 𝐓𝐢𝐦𝐞 (GMT)*: ${time}\n│❒ *💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐞*: Yo, I'm KATE AI, ready to rock! Set a custom vibe with *alive [message];[link]*! 😎\n│❒ *🤖 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝘡𝘌𝘡𝘌 𝘛𝘌𝘊𝘏*\n◈━━━━━━━━━━━━━━━━◈`;
                repondre(aliveMsg);
            }
        } else {
            if (!superUser) { 
                repondre(`KATE{AI\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ 🛑 Yo, only KATE AI can mess with ZEZE TECH vibe! 😡\n◈━━━━━━━━━━━━━━━━◈`); 
                return;
            }

            const [texte, tlien] = arg.join(' ').split(';');
            await addOrUpdateDataInAlive(texte, tlien);
            repondre(`KATE AI\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ ✅ KATE AI alive message updated! You’re killing it! 🔥\n◈━━━━━━━━━━━━━━━━◈`);
        }
    }
);
