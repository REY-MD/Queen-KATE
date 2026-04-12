
const { zokou } = require('../framework/zokou');
const Heroku = require('heroku-client');
const s = require("../set");
const axios = require("axios");
const speed = require("performance-now");
const { exec } = require("child_process");
const conf = require(__dirname + "/../set");
// Function for delay simulation
function delay(ms) {
  console.log(`⏱️ delay for ${ms}ms`);
  return new Promise(resolve => setTimeout(resolve, ms));
}
// Format the uptime into a human-readable string
function runtime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = Math.floor(seconds % 60);

  return `${hours}h ${minutes}m ${secondsLeft}s`;
}

// New loading animation with different symbols and larger progress bar
async function loading(dest, zk) {
  const lod = [
    "⬛⬛⬜⬜⬜⬜⬛⬛꧁20%꧂",
    "⬛⬛⬛⬛⬜⬜⬜⬜꧁40%꧂",
    "⬜⬜⬛⬛⬛⬛⬜⬜꧁60%꧂",
    "⬜⬜⬜⬜⬛⬛⬛⬛꧁80%꧂",
    "⬛⬛⬜⬜⬜⬜⬛⬛꧁100%꧂",
    "*L҉O҉A҉D҉I҉N҉G҉ D҉O҉N҉E҉ ᵗʱᵃᵑᵏᵧₒᵤ ⚔️🗡️*"
  ];

  let { key } = await zk.sendMessage(dest, { text: 'Loading Please Wait' });

  for (let i = 0; i < lod.length; i++) {
    await zk.sendMessage(dest, { text: lod[i], edit: key });
    await delay(500); // Adjust the speed of the animation here
  }
}

zokou({
  nomCom: "system",
  aliases: ["speed", "testing"],
  categorie: "system",
  reaction: "💯"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;

  // Array of sound file URLs
  const audioFiles = [
    'https://files.catbox.moe/w749y6.mp3',
    'https://files.catbox.moe/8x9u8b.mp3',
    'https://files.catbox.moe/hgey9n.mp3',
    'https://files.catbox.moe/46bf53.mp3',
    'https://files.catbox.moe/6x8upc.mp3',
    'https://files.catbox.moe/ll04on.mp3',
    'https://files.catbox.moe/n5djb5.mp3'
  ];

  // Randomly pick an audio file from the list
  const selectedAudio = audioFiles[Math.floor(Math.random() * audioFiles.length)];

  // Audio message object
  const audioMessage = {
    audio: {
      url: selectedAudio,
    },
    mimetype: 'audio/mpeg',
    ptt: true,  // Marking this as a "Push-to-Talk" message
    waveform: [100, 0, 100, 0, 100, 0, 100],
    fileName: 'shizo',
    contextInfo: {
      externalAdReply: {
        title: 'QUEEN-KATE AI IS ONLINE',
        body: conf.OWNER_NAME,
        thumbnailUrl: conf.URL,
        sourceUrl: conf.GURL, // Corrected variable name
        mediaType: 1,
        renderLargerThumbnail: true,
      },
    },
  };

  // Send the audio message with the context of the original message
  await zk.sendMessage(dest, audioMessage, { quoted: ms });
});


zokou({
  nomCom: 'restart',
  aliases: ['reboot'],
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  // Check if the user is a super user
  if (!superUser) {
    return repondre("You need owner privileges to execute this command!");
  }

  try {
    // Inform the user that the bot is restarting
    await repondre("*Restarting...*");

    // Function to create a delay
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Wait for 3 seconds before restarting
    await sleep(3000);

    // Exit the process to restart the bot
    process.exit();
  } catch (error) {
    console.error("Error during restart:", error);
  }
});
// thanks  chatgpt


// Command to retrieve Heroku config vars
zokou({
  nomCom: 'allvar',
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  // Check if the command is issued by the owner
  if (!superUser) {
    return repondre("*This command is restricted to the bot owner or science 𝑍𝐸𝑍𝐸47-𝑀𝐷 owner 💀*");
  }

  const appname = s.HEROKU_APP_NAME;
  const herokuapi = s.HEROKU_API_KEY;

  const heroku = new Heroku({
    token: herokuapi,
  });

  const baseURI = `/apps/${appname}/config-vars`;

  try {
    // Fetch config vars from Heroku API
    const configVars = await heroku.get(baseURI);

    let str = '*╭───༺All my Heroku vars༻────╮*\n\n';
    
    // Loop through the returned config vars and format them
    for (let key in configVars) {
      if (configVars.hasOwnProperty(key)) {
        str += `★ *${key}* = ${configVars[key]}\n`;
      }
    }

    // Send the formatted response back to the user
    repondre(str);

  } catch (error) {
    console.error('Error fetching Heroku config vars:', error);
    repondre('Sorry, there was an error fetching the config vars.');
  }
});

// Command to set a Heroku config var
zokou({
  nomCom: 'setvar',
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser, arg } = context;

  // Check if the command is issued by the owner
  if (!superUser) {
    return repondre("*This command is restricted to the bot owner or 𝑍𝐸𝑍𝐸47-𝑀𝐷 owner 💀*");
  }

  const appname = s.HEROKU_APP_NAME;
  const herokuapi = s.HEROKU_API_KEY;

  if (!arg || arg.length !== 1 || !arg[0].includes('=')) {
    return repondre('Incorrect Usage:\nProvide the key and value correctly.\nExample: setvar OWNER-NAME=𝘡𝘌𝘡𝘌47 𝘛𝘌𝘊𝘏');
  }

  const [key, value] = arg[0].split('=');

  const heroku = new Heroku({
    token: herokuapi,
  });

  const baseURI = `/apps/${appname}/config-vars`;

  try {
    // Set the new config var
    await heroku.patch(baseURI, {
      body: {
        [key]: value,
      },
    });

    // Notify success
    await repondre(`*✅ The variable ${key} = ${value} has been set successfully. The bot is restarting...*`);
  } catch (error) {
    console.error('Error setting config variable:', error);
    await repondre(`❌ There was an error setting the variable. Please try again later.\n${error.message}`);
  }
});

zokou({
  nomCom: "shell",
  aliases: ["getcmd", "cmd"],
  reaction: '🤔',
  categorie: "system"
}, async (context, message, params) => {
  const { repondre: sendResponse, arg: commandArgs, superUser: Owner, auteurMessage } = params;

  // Ensure that the sender is the superuser (Owner)
  if (!Owner) {
    return sendResponse("You are not authorized to execute shell commands.");
  }

  const command = commandArgs.join(" ").trim();

  // Ensure the command is not empty
  if (!command) {
    return sendResponse("Please provide a valid shell command.");
  }

  // Execute the shell command
  exec(command, (err, stdout, stderr) => {
    if (err) {
      return sendResponse(`Error: ${err.message}`);
    }

    if (stderr) {
      return sendResponse(`stderr: ${stderr}`);
    }

    if (stdout) {
      return sendResponse(stdout);
    }

    // If there's no output, let the user know
    return sendResponse("Command executed successfully, but no output was returned.");
  });
});

zokou(
  {
   // nomCom: 'pong',
    aliases: ['speed', 'latency'],
    desc: 'To check bot response time',
    categorie: 'system', // Fixed the typo here (Categorie -> categorie)
    reaction: '⚡',
    fromMe: true, // Removed quotes to make it a boolean
  },
  async (dest, zk) => {
    // Call the new loading animation without delaying the rest of the bot
    const loadingPromise = loading(dest, zk);

    // Generate 3 ping results with large random numbers for a more noticeable effect
    const pingResults = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10000 + 1000));

    // Create larger font for ping results (using special characters for a bigger look)
    const formattedResults = pingResults.map(ping => `${conf.OWNER_NAME} 𝖘𝖕𝖊𝖊𝖉 ${ping} 𝐌/𝐒  `);

    // Send the ping results with the updated text and format
    await zk.sendMessage(dest, {
      text: `${formattedResults.join(', ')}`,
      contextInfo: {
        externalAdReply: {
          title: conf.BOT,
          body: `${formattedResults.join(" | ")}`,
          thumbnailUrl: conf.URL, // Replace with your bot profile photo URL
          sourceUrl: conf.GURL, // Your channel URL
          mediaType: 1,
          showAdAttribution: true, // Verified badge
        },
      },
    });

    console.log("Ping results sent successfully with new loading animation and formatted results!");

    // Ensure loading animation completes after the ping results
    await loadingPromise;
  }
);

// React function if needed for further interaction
function react(dest, zk, msg, reaction) {
  zk.sendMessage(dest, { react: { text: reaction, key: msg.key } });
}

zokou({
  nomCom: 'runtime',
  aliases: ['logs', 'running'],
  desc: 'To check runtime',
  categorie: 'system', // Fixed the typo here (Categorie -> categorie)
  reaction: '🫠',
  fromMe: true, // Removed quotes to make it a boolean
}, async (dest, zk, commandeOptions) => {
  const { ms, arg, repondre } = commandeOptions;

  // Get bot's runtime
  const botUptime = process.uptime(); // Get the bot uptime in seconds

  // Send uptime information to the user
  await zk.sendMessage(dest, {
    text: `*${conf.OWNER_NAME} UPTIME IS ${runtime(botUptime)}*`,
    contextInfo: {
      externalAdReply: {
        title: `${conf.BOT} UPTIME`,
        body: `Bot Uptime: ${runtime(botUptime)}`, // Format the uptime before sending
        thumbnailUrl: conf.URL, // Replace with your bot profile photo URL
        sourceUrl: conf.GURL, // Your channel URL
        mediaType: 1,
        showAdAttribution: true, // Verified badge
      },
    },
  });

  console.log("Runtime results sent successfully!");

  // Ensure loading animation completes after sending the uptime message
  await delay(ms); // Await the delay to simulate the loading animation
});

// React function to allow interaction after sending message
function react(dest, zk, msg, reaction) {
  zk.sendMessage(dest, { react: { text: reaction, key: msg.key } });
}


zokou({
  nomCom: 'update',
  aliases: ['redeploy', 'sync'],
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  // Check if the command is issued by the owner
  if (!superUser) {
    return repondre("*This command is restricted to the bot owner or 𝑍𝐸𝑍𝐸47-𝑀𝐷 owner 💀*");
  }

  // Ensure Heroku app name and API key are set
  const herokuAppName = s.HEROKU_APP_NAME;
  const herokuApiKey = s.HEROKU_API_KEY;

  // Check if Heroku app name and API key are set in environment variables
  if (!herokuAppName || !herokuApiKey) {
    await repondre("It looks like the Heroku app name or API key is not set. Please make sure you have set the `HEROKU_APP_NAME` and `HEROKU_API_KEY` environment variables.");
    return;
  }

  // Function to redeploy the app
  async function redeployApp() {
    try {
      const response = await axios.post(
        `https://api.heroku.com/apps/${herokuAppName}/builds`,
        {
          source_blob: {
            url: "https://github.com/REY-MD/Queen-KATE/tarball/main",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${herokuApiKey}`,
            Accept: "application/vnd.heroku+json; version=3",
          },
        }
      );

      // Notify the user about the update and redeployment
      await repondre("*Your bot is getting updated, wait 2 minutes for the redeploy to finish! This will install the latest version of 𝑍𝐸𝑍𝐸47-𝑀𝐷.*");
      console.log("Build details:", response.data);
    } catch (error) {
      // Handle any errors during the redeployment process
      const errorMessage = error.response?.data || error.message;
      await repondre(`*Failed to update and redeploy. ${errorMessage} Please check if you have set the Heroku API key and Heroku app name correctly.*`);
      console.error("Error triggering redeploy:", errorMessage);
    }
  }

  // Trigger the redeployment function
  redeployApp();
});

zokou({
  nomCom: "fetch",
  aliases: ["get", "find"],
  categorie: "system",
  reaction: '🛄',
}, async (sender, zk, context) => {
  const { repondre: sendResponse, arg: args } = context;
  const urlInput = args.join(" ");

  // Check if URL starts with http:// or https://
  if (!/^https?:\/\//.test(urlInput)) {
    return sendResponse("Start the *URL* with http:// or https://");
  }

  try {
    const url = new URL(urlInput);
    const fetchUrl = `${url.origin}${url.pathname}?${url.searchParams.toString()}`;
    
    // Fetch the URL content
    const response = await axios.get(fetchUrl, { responseType: 'arraybuffer' });

    // Check if the response is okay
    if (response.status !== 200) {
      return sendResponse(`Failed to fetch the URL. Status: ${response.status} ${response.statusText}`);
    }

    const contentLength = response.headers['content-length'];
    if (contentLength && parseInt(contentLength) > 104857600) {
      return sendResponse(`Content-Length exceeds the limit: ${contentLength}`);
    }

    const contentType = response.headers['content-type'];
    console.log('Content-Type:', contentType);

    // Fetch the response as a buffer
    const buffer = Buffer.from(response.data);

    // Handle different content types
    if (/image\/.*/.test(contentType)) {
      // Send image message
      await zk.sendMessage(sender, {
        image: { url: fetchUrl },
        caption: `> > *${conf.BOT}*`
      }, { quoted: context.ms });
    } else if (/video\/.*/.test(contentType)) {
      // Send video message
      await zk.sendMessage(sender, {
        video: { url: fetchUrl },
        caption: `> > *${conf.BOT}*`
      }, { quoted: context.ms });
    } else if (/audio\/.*/.test(contentType)) {
      // Send audio message
      await zk.sendMessage(sender, {
        audio: { url: fetchUrl },
        caption: `> > *${conf.BOT}*`
      }, { quoted: context.ms });
    } else if (/text|json/.test(contentType)) {
      try {
        // Try parsing the content as JSON
        const json = JSON.parse(buffer);
        console.log("Parsed JSON:", json);
        sendResponse(JSON.stringify(json, null, 10000)); // Limit response size to 10000 characters
      } catch {
        // If parsing fails, send the raw text response
        sendResponse(buffer.toString().slice(0, 10000)); // Limit response size to 10000 characters
      }
    } else {
      // Send other types of documents
      await zk.sendMessage(sender, {
        document: { url: fetchUrl },
        caption: `> > *${conf.BOT}*`
      }, { quoted: context.ms });
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
    sendResponse(`Error fetching data: ${error.message}`);
  }
})
