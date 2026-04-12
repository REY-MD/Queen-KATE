const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const conf = require(__dirname + "/../set");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)

zokou({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre ,prefixe,nomAuteurMessage,mybotpic} = commandeOptions;
    let { cm } = require(__dirname + "/../framework//zokou");
    var coms = {};
    var mode = "public";
    
    if ((s.MODE).toLocaleLowerCase() != "yes") {
        mode = "private";
    }


    

    cm.map(async (com, index) => {
        if (!coms[com.categorie])
            coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });

    moment.tz.setDefault ("Africa/nairobi");

// Créer une date et une heure en GMT
const temps = moment().format('HH:mm:ss');
const date = moment().format('DD/MM/YYYY');

  let infoMsg =  `
  ╭━━━ 〔 •QUEEN-KATE AI• 〕━━━┈⊷♦ 
┃♦╭──♦───♦────♦─────♥
┃♦│ ❑ ▸  *𝙳𝚊𝚝𝚎*:┈⊷ ${date}
┃♦│ ❑ ▸  *𝚃𝚒𝚖𝚎 𝚗𝚘𝚠*: ┈⊷ ${temps}
┃♦│ ❑ ▸  *𝙿𝚛𝚎𝚏𝚒𝚡* :┈⊷ [  ${s.PREFIXE}  ]
┃♦│ ❑ ▸  *𝙼𝚘𝚍𝚎* : ┈⊷ ${mode} mode
┃♦│ ❑ ▸  *𝙿𝚕𝚞𝚐𝚒𝚗𝚜* :┈⊷ ${cm.length}
┃♦│ ❑ ▸  *𝚁𝚊𝚖* :┈⊷ ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
┃♦│ ❑ ▸  *𝚁𝚞𝚗𝚗𝚒𝚗𝚐 𝚘𝚗* : ┈⊷ ${os.platform()}
┃♦│ ❑ ▸  *𝙾𝚠𝚗𝚎𝚛* : ┈⊷ ${s.OWNER_NAME}
┃♦│ ❑ ▸  *ᴅᴇᴠᴇʟᴏᴘᴇʀ* : ┈⊷ ZEZE TECH
┃♦│ ❑ ▸  *ᴛɪᴍᴇᴢᴏɴᴇ* :┈⊷ ${s.TZ}
┃♦╰───────────────♦
╰━━━━━━━━━━━━━━━┈⊷♦

> QUEEN-KATE AI make u enjoy\n${readmore}`;
    
    
let menuMsg = `

 *QUEEN-KATE AI SUPER COMMADS*`;

    for (const cat in coms) {
        menuMsg += ` ╭──────✣ *${cat}* ✣─────☹︎`;
        for (const cmd of coms[cat]) {
            menuMsg += `
│♥│ ${cmd}`;
        }
        menuMsg += `
╰────────────···▸▸ \n`
    }

    menuMsg += `> powered by 𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇
`;

   var lien = mybotpic();

   if (lien.match(/\.(mp4|gif)$/i)) {
    try {
        zk.sendMessage(dest, {
      text: infoMsg + menuMsg,
      contextInfo: {
          forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363295141350550@newsletter',
              newsletterName: '𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇',
              serverMessageId: 143},
        externalAdReply: {
          title: "Enjoy...",
          body: "𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇",
          thumbnailUrl: "https://o.uguu.se/alLgUEwf.jpg",
          sourceUrl: conf.GURL,
          mediaType: 1,
            renderLargerThumbnail: true,

          showAdAttribution: false
        }
      }
    }, { quoted: ms });
    }
    catch (e) {
        console.log("🥵🥵 Menu erreur " + e);
        repondre("🥵🥵 Menu erreur " + e);
    }
} 
// Vérification pour .jpeg ou .png
else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
    try {
        zk.sendMessage(dest, {
      text: infoMsg + menuMsg,
      contextInfo: {
          forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363295141350550@newsletter',
              newsletterName: '𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇',
              serverMessageId: 143},
        externalAdReply: {
          title: "Enjoy...",
          body: "𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇",
          thumbnailUrl: "https://o.uguu.se/alLgUEwf.jpg",
          sourceUrl: conf.GURL,
          mediaType: 1,
            renderLargerThumbnail: true,

          showAdAttribution: false
        }
      }
    }, { quoted: ms });
      }
    catch (e) {
        console.log("🥵🥵 Menu erreur " + e);
        repondre("🥵🥵 Menu erreur " + e);
    }
} 
else {
    zk.sendMessage(dest, {
      text: infoMsg + menuMsg,
      contextInfo: {
          forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363295141350550@newsletter',
              newsletterName: '𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇',
              serverMessageId: 143},
        externalAdReply: {
          title: "Enjoy...",
          body: "KATE AI LOVE MENU❣️",
          thumbnailUrl: "https://o.uguu.se/alLgUEwf.jpg",
          sourceUrl: conf.GURL,
          mediaType: 1,
            renderLargerThumbnail: true


        }
      }
    }, { quoted: ms });
    
}

});
