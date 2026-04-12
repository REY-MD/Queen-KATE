const { zokou } = require("../framework/zokou");
const axios = require("axios");
const Genius = require("genius-lyrics");
const Client = new Genius.Client("your-genius-api-key"); // Replace with actual key

// ==================== BIBLE COMMAND ====================
zokou({
  nomCom: "bible",
  reaction: "📖",
  categorie: "General"
}, async (message, sender, args) => {
  const { repondre, arg, ms } = args;
  const searchQuery = arg.join(" ");
  
  if (!searchQuery) {
    return repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐬𝐩𝐞𝐜𝐢𝐟𝐲 𝐛𝐨𝐨𝐤, 𝐜𝐡𝐚𝐩𝐭𝐞𝐫 𝐚𝐧𝐝 𝐯𝐞𝐫𝐬𝐞.\n𝐄𝐱𝐚𝐦𝐩𝐥𝐞: .𝐛𝐢𝐛𝐥𝐞 𝐑𝐨𝐦𝐚𝐧𝐬 𝟔:𝟐𝟑");
  }

  try {
    const response = await fetch(`https://bible-api.com/${encodeURIComponent(searchQuery)}`);
    const data = await response.json();

    const replyText = `
╔════◇ *𝐇𝐎𝐋𝐘 𝐁𝐈𝐁𝐋𝐄* ◇════╗
📜 *𝐑𝐞𝐟𝐞𝐫𝐞𝐧𝐜𝐞:* ${data.reference}
🔢 *𝐕𝐞𝐫𝐬𝐞𝐬:* ${data.verses.length}
🌍 *𝐓𝐫𝐚𝐧𝐬𝐥𝐚𝐭𝐢𝐨𝐧:* ${data.translation_name}

${data.text}

╚════◇ *𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝘡𝘌𝘡𝘌 𝘛𝘌𝘊𝘏* ◇════╝
    `;
    repondre(replyText);
  } catch (error) {
    repondre("❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐛𝐢𝐛𝐥𝐞 𝐫𝐞𝐟𝐞𝐫𝐞𝐧𝐜𝐞. 𝐓𝐫𝐲: .𝐛𝐢𝐛𝐥𝐞 𝐉𝐨𝐡𝐧 𝟑:𝟏𝟔");
  }
});

// ==================== POLL COMMAND ====================
zokou({
  nomCom: "poll",
  reaction: "📊",
  categorie: "General"
}, async (message, sender, args) => {
  const { repondre, arg, ms } = args;
  
  if (!arg[0] || !arg.join(" ").includes("/")) {
    return repondre(`
𝐈𝐧𝐜𝐨𝐫𝐫𝐞𝐜𝐭 𝐟𝐨𝐫𝐦𝐚𝐭!
𝐄𝐱𝐚𝐦𝐩𝐥𝐞: 
.𝐩𝐨𝐥𝐥 𝐖𝐡𝐢𝐜𝐡 𝐢𝐬 𝐛𝐞𝐭𝐭𝐞𝐫?/KATE AI,𝐄𝐧𝐳𝐨,𝐙𝐨𝐤𝐨𝐮
    `);
  }

  const [question, ...options] = arg.join(" ").split("/");
  await sender.sendMessage(message, {
    poll: {
      name: question,
      values: options.map(opt => opt.trim())
    }
  });
});

// ==================== FACT COMMAND ====================
zokou({
  nomCom: "fact",
  reaction: "🔍",
  categorie: "Fun"
}, async (message, sender, args) => {
  try {
    const response = await fetch("https://nekos.life/api/v2/fact");
    const { fact } = await response.json();
    
    repondre(`
╔════◇ *𝐑𝐀𝐍𝐃𝐎𝐌 𝐅𝐀𝐂𝐓* ◇════╗
${fact}
╚════◇ *𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇* ◇════╝
    `);
  } catch {
    repondre("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐠𝐞𝐭 𝐟𝐚𝐜𝐭. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧!");
  }
});

// ==================== QUOTES COMMAND ====================
zokou({
  nomCom: "quotes",
  reaction: "💬",
  categorie: "Fun"
}, async (message, sender, args) => {
  try {
    const response = await fetch("https://favqs.com/api/qotd");
    const { quote } = await response.json();
    
    repondre(`
╔════◇ *𝐃𝐀𝐈𝐋𝐘 𝐐𝐔𝐎𝐓𝐄* ◇════╗
"${quote.body}"
- ${quote.author}
╚════◇ *𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇* ◇════╝
    `);
  } catch {
    repondre("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐠𝐞𝐭 𝐪𝐮𝐨𝐭𝐞. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧!");
  }
});

// ==================== DEFINITION COMMAND ====================
zokou({
  nomCom: "define",
  reaction: "📚",
  categorie: "Search"
}, async (message, sender, args) => {
  const { repondre, arg } = args;
  
  if (!arg[0]) {
    return repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐭𝐞𝐫𝐦 𝐭𝐨 𝐝𝐞𝐟𝐢𝐧𝐞");
  }

  try {
    const term = arg.join(" ");
    const { data } = await axios.get(`http://api.urbandictionary.com/v0/define?term=${term}`);
    
    if (!data.list[0]) {
      return repondre(`❌ 𝐍𝐨 𝐝𝐞𝐟𝐢𝐧𝐢𝐭𝐢𝐨𝐧 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 "${term}"`);
    }

    const definition = data.list[0].definition.replace(/\[|\]/g, '');
    const example = data.list[0].example.replace(/\[|\]/g, '');
    
    repondre(`
╔════◇ *𝐃𝐄𝐅𝐈𝐍𝐈𝐓𝐈𝐎𝐍* ◇════╗
🔤 *𝐓𝐞𝐫𝐦:* ${term}
📝 *𝐃𝐞𝐟𝐢𝐧𝐢𝐭𝐢𝐨𝐧:* ${definition}
💡 *𝐄𝐱𝐚𝐦𝐩𝐥𝐞:* ${example}
╚════◇ *𝐙𝐄𝐙𝐄-𝐓𝐄𝐂𝐇* ◇════╝
    `);
  } catch {
    repondre("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐠𝐞𝐭 𝐝𝐞𝐟𝐢𝐧𝐢𝐭𝐢𝐨𝐧. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧!");
  }
});
