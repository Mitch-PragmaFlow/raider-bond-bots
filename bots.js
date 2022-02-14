const Discord = require("discord.js");
const { Client, Intents } = require("discord.js");
const getBondPrice = require("./bondPrice");

// The update Delay in seconds
const updateDelay = 30;

function botStart() {
  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  });
  // Fetch new bond price and update status
  const updateBondPrice = async () => {
    // We'll catch errors here, since any error as part of
    //  fetching the bond price makes it impossible to calc.
    //  an updated bond price.
    //
    // The result is that the status doesn't update, and the displayed
    //  bond price remains the same.
    // Could also update the bot's status type or something to indicate an error...
    try {
      const { bondPrice, discount } = await getBondPrice();
      client.user.setActivity(
        `Discount: ${Intl.NumberFormat("en-US", {
          style: "percent",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(discount))}`,
        { type: "WATCHING" }
      );
    } catch (error) {
      // Log error to console
      console.error("Error updating bond price", error);
      // Probably not do anything else.  It will run again in <updateDelay> seconds.
      //    but if the error's consistent, should probably be alerted somehow.
    }
  };

  client.on("ready", async () => {
    // List servers the bot is connected to
    console.log("Servers:");
    client.guilds.cache.forEach((guild) => {
      console.log(" - " + guild.name);
    });
    // Start a repeating function that runs every <updateDelay> seconds to
    //    fetch the bond price and update the bot's activity.
    setInterval(updateBondPrice, 1000 * updateDelay);
    // Run the update for the first time
    updateBondPrice();
  });

  return client;
}

module.exports = botStart;
