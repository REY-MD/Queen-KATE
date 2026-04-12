const { zokou } = require('../framework/zokou');
const conf = require('../set');

zokou({
    nomCom: "antidelete",
    categorie: "Settings",
    reaction: "🛡️"
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, superUser, prefixe } = commandeOptions;

    // Only the Owner can change these settings
    if (!superUser) return repondre("❌ Access Denied. This command is for the Owner only.");

    // Help Menu
    if (!arg[0]) {
        return repondre(`*🛡️ QUEEN-KATE ANTI-DELETE SETTINGS*\n\n` +
            `Current State: *${conf.ANTIDELETE === 'yes' ? 'ENABLED' : 'DISABLED'}*\n` +
            `Destination: *${conf.ANTIDELETE_DEST === 'group' ? 'GROUP' : 'DM (PRIVATE)'}*\n\n` +
            `*Usage:* \n` +
            `🔹 *${prefixe}antidelete on* - Enable system\n` +
            `🔹 *${prefixe}antidelete off* - Disable system\n` +
            `🔹 *${prefixe}antidelete set dm* - Send deleted items to your PM\n` +
            `🔹 *${prefixe}antidelete set group* - Restore items back to the Group`);
    }

    const action = arg[0].toLowerCase();

    if (action === "on") {
        conf.ANTIDELETE = "yes";
        return repondre("✅ Anti-delete system is now ENABLED.");
    } 
    
    if (action === "off") {
        conf.ANTIDELETE = "no";
        return repondre("❌ Anti-delete system is now DISABLED.");
    }

    if (action === "set" && arg[1]) {
        const mode = arg[1].toLowerCase();
        if (mode === "dm") {
            conf.ANTIDELETE_DEST = "dm";
            return repondre("✅ Logs will now be sent to your Private DM.");
        } else if (mode === "group") {
            conf.ANTIDELETE_DEST = "group";
            return repondre("✅ Logs will now be restored back to the Group.");
        }
    }
});
