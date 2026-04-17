const { zokou } = require("../framework/zokou");

zokou(
  {
    nomCom: "setdesc",
    aliases: ["setstatus", "setgroupdesc"],
    categorie: "Group",
    reaction: "✏️",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, verifGroupe, verifAdmin, verifBotAdmin } =
      commandeOptions;

    // ✅ Angalia kama iko kwenye group
    if (!verifGroupe) {
      return repondre("❌ Command hii inafanya kazi kwenye *group* tu!");
    }

    // ✅ Angalia kama mtumiaji ni admin
    if (!verifAdmin) {
      return repondre("❌ Lazima uwe *Admin* wa group kuweza kubadilisha status!");
    }

    // ✅ Angalia kama bot ni admin
    if (!verifBotAdmin) {
      return repondre(
        "❌ Nifanye *Admin* wa group kwanza ili niweze kubadilisha status!"
      );
    }

    // ✅ Angalia kama maandishi yametolewa
    const newDesc = arg.join(" ");
    if (!newDesc || newDesc.trim() === "") {
      return repondre(
        "📝 Toa maandishi ya status!\n\n*Mfano:* `.setdesc Karibu kwenye group yetu! 🎉`"
      );
    }

    try {
      // ✅ Weka group description mpya
      await zk.groupUpdateDescription(dest, newDesc.trim());

      await repondre(
        `✅ *Status ya Group Imewekwa!*\n\n📝 *Status Mpya:*\n${newDesc.trim()}`
      );
    } catch (error) {
      console.error("setdesc error:", error);
      await repondre(
        "❌ Imeshindwa kuweka status. Hakikisha mimi ni *Admin* wa group!"
      );
    }
  }
);
