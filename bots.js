const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const getBondPrice = require('./bondPrice');

// The update Delay in seconds
const updateDelay = 30;

function botStart() {
  const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
  // Fetch new bond price and update status
  const updateBondPrice = async () => {
    const {bondPrice, discount} = await getBondPrice();
    client.user.setActivity( `Discount: ${Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(discount))}` , { type: "WATCHING" });
  };   

  client.on('ready', async () => {
    // List servers the bot is connected to
    console.log("Servers:")
    client.guilds.cache.forEach((guild) => {
      console.log(" - " + guild.name)
    })
    // Start a repeating function that runs every <updateDelay> seconds to
    //    fetch the bond price and update the bot's activity.
    setInterval(updateBondPrice, 1000 * updateDelay);
    // Run the update for the first time
    updateBondPrice();
  });

  return client;
}

module.exports = botStart;
