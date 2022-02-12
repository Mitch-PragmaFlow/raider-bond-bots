//const os = require('os')
const Discord = require('discord.js')
const { Client, Intents } = require('discord.js');

const keepAlive = require('./server');
const getBondPrice = require('./bondPrice')


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });



client.on('ready', () => {
    // List servers the bot is connected to
    console.log("Servers:")
    client.guilds.cache.forEach((guild) => {
        console.log(" - " + guild.name)
    })

    // Set bot status to: "Playing with JavaScript"
    client.user.setActivity("with JavaScript")

    // Alternatively, you can set the activity to any of the following:
    // PLAYING, STREAMING, LISTENING, WATCHING
    // For example:
    // client.user.setActivity("TV", {type: "WATCHING"})

})



keepAlive();

getBondPrice("RMbondBot");

bot_secret_token = process.env.RMbondBot
client.login(bot_secret_token);