const { zokou } = require("../framework/zokou");
const {getAllSudoNumbers,isSudoTableNotEmpty} = require("../bdd/sudo")
const conf = require("../set");

zokou({ nomCom: "owner", categorie: "General", reaction: "❣️" }, async (dest, zk, commandeOptions) => {
    const { ms , mybotpic, repondre } = commandeOptions;
    
    const thsudo = await isSudoTableNotEmpty()

    if (thsudo) {
        let msg = `╔════◇ *KATE AI 𝐎𝐖𝐍𝐄𝐑𝐒* ◇════╗\n\n`
        
        // Primary owner (must be 255690126564)
        msg += `*👑 𝐌𝐚𝐢𝐧 𝐎𝐰𝐧𝐞𝐫:*\n• @255617657675\n\n`
        
        // Secondary owner (must be 255617657675)
        msg += `*🌟 𝐒𝐞𝐜𝐨𝐧𝐝𝐚𝐫𝐲 𝐎𝐰𝐧𝐞𝐫:*\n• @255617657675\n\n`
        
        // Other sudo users
        let sudos = await getAllSudoNumbers()
        if (sudos.length > 0) {
            msg += `───── *𝐎𝐭𝐡𝐞𝐫 𝐒𝐮𝐝𝐨𝐬* ─────\n`
            for (const sudo of sudos) {
                if (sudo) {
                    const sudonumero = sudo.replace(/[^0-9]/g, '');
                    // Skip if it's one of our required numbers
                    if (!['255617657675', '255617657675'].includes(sudonumero)) {
                        msg += `• @${sudonumero}\n`;
                    }
                }
            }
        }
        msg += `╚════◇ *𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝘡𝘌𝘡𝘌47 𝘛𝘌𝘊𝘏* ◇════╝`

        const mentionedJid = [
            '255617657675@s.whatsapp.net',
            '255760109840@s.whatsapp.net',
            ...sudos.map(num => num.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
        ].filter(num => !['255617657675', '255617657675'].includes(num.replace(/@s\.whatsapp\.net/, '')))

        zk.sendMessage(
            dest,
            {
                image: { url: mybotpic() },
                caption: msg,
                mentions: mentionedJid
            },
            { quoted: ms }
        )
    } else {
        // VCARD for primary owner
        const vcard = 
            'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            'FN:' + conf.OWNER_NAME + '\n' +
            'ORG:𝐙𝐄𝐙𝐄-𝐌𝐃 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐦𝐞𝐧𝐭;\n' +
            'TEL;type=CELL;type=VOICE;waid=255617657675:+255617657675\n' +
            'END:VCARD';

        zk.sendMessage(
            dest,
            {
                contacts: {
                    displayName: "KATE AI owner",
                    contacts: [{ vcard }],
                },
            },
            { quoted: ms }
        );
    }
});

zokou({ nomCom: "dev", categorie: "General", reaction: "💘" }, async (dest, zk, commandeOptions) => {
    const { ms, mybotpic } = commandeOptions;

    const devs = [
        { nom: "𝘡𝘌𝘡𝘌47 𝘛𝘌𝘊𝘏", numero: "255617657675" },
        { nom: "𝐙𝐄𝐙𝐄𝟒𝟕-𝐌𝐃 𝐃𝐞𝐯", numero: "255690126564" }
    ];

    let message = `╔════◇ *𝐙𝐄𝐙𝐄𝟒𝟕-𝐌𝐃 V² 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑𝐒* ◇════╗\n\n`;
    message += `*🚀 𝐂𝐨𝐧𝐭𝐚𝐜𝐭 𝐨𝐮𝐫 𝐝𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫𝐬 𝐟𝐨𝐫 𝐬𝐮𝐩𝐩𝐨𝐫𝐭:*\n\n`;
    
    for (const dev of devs) {
        message += `• *${dev.nom}*: https://wa.me/${dev.numero}\n`;
    }
    
    message += `\n╚════◇ *𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝘡𝘌𝘡𝘌 𝘛𝘌𝘊𝘏* ◇════╝`;

    try {
        const lien = mybotpic();
        if (lien.match(/\.(mp4|gif)$/i)) {
            await zk.sendMessage(
                dest,
                { 
                    video: { url: lien }, 
                    caption: message 
                },
                { quoted: ms }
            );
        } else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
            await zk.sendMessage(
                dest,
                { 
                    image: { url: lien }, 
                    caption: message 
                },
                { quoted: ms }
            );
        } else {
            await repondre(message);
        }
    } catch (e) {
        console.error("❌ 𝐄𝐫𝐫𝐨𝐫:", e);
        repondre("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐬𝐞𝐧𝐝 𝐝𝐞𝐯 𝐥𝐢𝐬𝐭. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧.");
    }
});

zokou({ nomCom: "support", categorie: "General", reaction: "🔗" }, async (dest, zk, commandeOptions) => {
    const { ms, repondre, auteurMessage } = commandeOptions; 

    const supportMessage = `
╔════◇ *QUEEN-KATE AI SUPPORT* ◇════╗

*💝 𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐟𝐨𝐫 𝐜𝐡𝐨𝐨𝐬𝐢𝐧𝐠 KATE AI!❣️*
........ support me on my.....
*📢 𝐂𝐡𝐚𝐧𝐧𝐞𝐥:*
https://whatsapp.com/channel/0029VaeRrcnADTOKzivM0S1r

*👥 𝐒𝐮𝐩𝐩𝐨𝐫𝐭 𝐆𝐫𝐨𝐮𝐩:*
https://chat.whatsapp.com/

*🎥 𝐘𝐨𝐮𝐓𝐮𝐛𝐞:*
https://www.youtube.com/@Humphrey47Mbise

*🔥 Tick-tock:*
https://vm.tiktok.com/ZMS2H8vPx/

*💌 Instagram:*
https://www.instagram.com/humphreymbise255?igsh=MzNlNGNkZWQ4Mg==

...☺️THANKS FOR YOUR SUPPORT😊...
╚════◇ *𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝘡𝘌𝘡𝘌47 𝘛𝘌𝘊𝘏* ◇════╝
    `;

    await repondre(supportMessage);
    await zk.sendMessage(
        auteurMessage,
        {
            text: `*📩 𝐒𝐮𝐩𝐩𝐨𝐫𝐭 𝐥𝐢𝐧𝐤𝐬 𝐬𝐞𝐧𝐭 𝐭𝐨 𝐲𝐨𝐮𝐫 𝐃𝐌!*\n\n𝐏𝐥𝐞𝐚𝐬𝐞📡 𝐣𝐨𝐢𝐧 or follow or line 𝐟𝐨𝐫 𝐮𝐩𝐝𝐚𝐭𝐞𝐬 𝐚𝐧𝐝 𝐬𝐮𝐩𝐩𝐨𝐫𝐭.`
        },
        { quoted: ms }
    );
});
