const { zokou } = require('../framework/zokou');

zokou(
  {
    nomCom: 'info',
    categorie: 'General',
    reaction: '🗿'
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefix, nomAuteurMessage } = commandeOptions;

    try {
      // Group and Channel links
      const groupLink = '';
      const channelLink = 'https://whatsapp.com/channel/0029VaeRrcnADTOKzivM0S1r';

      // Prepare the info message content
      const infoMsg = `
𝐙𝐄𝐙𝐄𝟒𝟕-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ Yo ${nomAuteurMessage}, here’s the dope on KATE AI! 🔥
│❒ *📩 𝐆𝐫𝐨𝐮𝐩*: ${groupLink}
│❒ *📢 𝐂𝐡𝐚𝐧𝐧𝐞𝐥*: ${channelLink}
│❒ Wanna vibe with the owner? Use *${prefix}owner*! 😎
│❒ Powered by 𝘡𝘌𝘡𝘌 𝘛𝘌𝘊𝘏
◈━━━━━━━━━━━━━━━━◈
      `;

      // Send the info message
      await zk.sendMessage(
        dest,
        {
          text: infoMsg,
          footer: `Hey ${nomAuteurMessage}! I'm Toxic-MD, created by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 😎`
        },
        { quoted: ms }
      );

    } catch (error) {
      console.error("Error in info command:", error.stack);
      await repondre(`KATE AI\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ TOTAL BUST, ${nomAuteurMessage}! KATE AI tripped while dropping the info: ${error.message} 😡 Try again or flop! 😣\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);
