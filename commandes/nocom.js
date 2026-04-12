const { zokou } = require('../framework/zokou');
const { attribuerUnevaleur } = require('../bdd/welcome');

async function events(nomCom) {
    zokou({
        nomCom: nomCom,
        categorie: 'Group',
        reaction: '⚙️'
    }, async (dest, zk, commandeOptions) => {
        const { ms, arg, repondre, superUser, verifAdmin, nomAuteurMessage } = commandeOptions;

        if (!verifAdmin && !superUser) {
            return repondre(`KATE AI\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, you ain’t got the keys to mess with ${nomCom}! 😡 Only admins or 𝘡𝘌𝘡𝘌 𝘛𝘌𝘊𝘏 can run KATE AI group vibes! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
        }

        if (!arg[0] || arg.join(' ').trim() === '') {
            return repondre(`KATE AI\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, don’t be lazy! Use *${nomCom} on* to activate or *${nomCom} off* to shut it down! 😎 KATE AI needs clear orders! 🔥\n◈━━━━━━━━━━━━━━━━◈`);
        }

        const setting = arg[0].toLowerCase();
        if (setting === 'on' || setting === 'off') {
            try {
                await attribuerUnevaleur(dest, nomCom, setting);
                await zk.sendMessage(
                    dest,
                    {
                        text: `KATE AI\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM, ${nomAuteurMessage}! ${nomCom} is now ${setting} for this group! 🔥\n│❒ ZEZE got it locked in! 🚀\n│❒ Powered by 𝘡𝘌𝘡𝘌 𝘛𝘌𝘊𝘏\n◈━━━━━━━━━━━━━━━━◈`,
                        footer: `Hey ${nomAuteurMessage}! I'm KATE AI, created by 𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇 😎`
                    },
                    { quoted: ms }
                );
            } catch (error) {
                console.error(`Error updating ${nomCom}:`, error);
                await repondre(`KATE AI\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ TOTAL BUST, ${nomAuteurMessage}! 𝐙𝐄𝐙𝐄𝟒𝟕-𝐌𝐃  tripped while setting ${nomCom}: ${error.message} 😡 Try again or flop! 😣\n◈━━━━━━━━━━━━━━━━◈`);
            }
        } else {
            repondre(`KATE AI\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, what’s this nonsense? 😡 Only *${nomCom} on* or *${nomCom} off* works for ZEZE MD Get it right! 🔧\n◈━━━━━━━━━━━━━━━━◈`);
        }
    });
}

   zokou({ nomCom: "antilink", categorie: 'Group', reaction: "🔗" }, async (dest, zk, commandeOptions) => {


  var { repondre, arg, verifGroupe, superUser, verifAdmin } = commandeOptions;
  

  
  if (!verifGroupe) {
    return repondre("*for groups only*");
  }
  
  if( superUser || verifAdmin) {
    const enetatoui = await verifierEtatJid(dest)
    try {
      if (!arg || !arg[0] || arg === ' ') { repondre("antilink on to activate the anti-link feature\nantilink off to deactivate the anti-link feature\nantilink action/remove to directly remove the link without notice\nantilink action/warn to give warnings\nantilink action/delete to remove the link without any sanctions\n\nPlease note that by default, the anti-link feature is set to delete.") ; return};
     
      if(arg[0] === 'on') {

      
       if(enetatoui ) { repondre("the antilink is already activated for this group")
                    } else {
                  await ajouterOuMettreAJourJid(dest,"oui");
                
              repondre("𝐓𝐡𝐞 𝐚𝐧𝐭𝐢𝐥𝐢𝐧𝐤 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲") }
     
            } else if (arg[0] === "off") {

              if (enetatoui) { 
                await ajouterOuMettreAJourJid(dest , "non");

                repondre("The antilink has been successfully deactivated");
                
              } else {
                repondre("antilink is not activated for this group");
              }
            } else if (arg.join('').split("/")[0] === 'action') {
                            

              let action = (arg.join('').split("/")[1]).toLowerCase() ;

              if ( action == 'remove' || action == 'warn' || action == 'delete' ) {

                await mettreAJourAction(dest,action);

                repondre(`The anti-link action has been updated to ${arg.join('').split("/")[1]}`);

              } else {
                  repondre("The only actions available are warn, remove, and delete") ;
              }
            

            } else repondre("antilink on to activate the anti-link feature\nantilink off to deactivate the anti-link feature\nantilink action/remove to directly remove the link without notice\nantilink action/warn to give warnings\nantilink action/delete to remove the link without any sanctions\n\nPlease note that by default, the anti-link feature is set to delete.")

      
    } catch (error) {
       repondre(error)
    }

  } else { repondre('𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐜𝐚𝐧 𝐨𝐧𝐥𝐲 𝐛𝐞 𝐮𝐬𝐞𝐝 𝐛𝐲 𝐀𝐝𝐦𝐢𝐧 🤖') ;
    }
 });

// Register the commands
events('welcome');
events('goodbye');
events('antipromote');
events('antidemote');
