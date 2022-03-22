const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const getRMBondPrice = require('./rmBondPrice');
const getAMBondPrice = require('./amBondPrice');
const express = require('express');
const server = express();

// The update Delay in seconds
const updateDelay = 30;
const RMbot_secret_token = process.env.RMbondBot;
const AMbot_secret_token = process.env.AMbondBot;

const RMclient = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const AMclient = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

RMclient.on('ready', async () => {
  // List servers the bot is connected to
  console.log("\n RM Servers:")
  RMclient.guilds.cache.forEach((guild) => {
    console.log(" - " + guild.name)
  })
});

AMclient.on('ready', async () => {
  // List servers the bot is connected to
  console.log("\n AM Servers:")
  RMclient.guilds.cache.forEach((guild) => {
    console.log(" - " + guild.name)
  })
});

// Fetch new Raider/Matic price and update status
const updateRMBondPrice = async () => {
  const {bondPrice, discount} = await getRMBondPrice();
  RMclient.user.setActivity( `${Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(discount))}` , { type: "WATCHING" });
};   

// Fetch new Aurum/Matic price and update status
const updateAMBondPrice = async () => {
  const {bondPrice, discount} = await getAMBondPrice();
  AMclient.user.setActivity( `${Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(discount))}` , { type: "WATCHING" });
};   

//Default Route
server.all('/', async (req, res) => {
  console.log('Bot update by ping to default route');
  let errorThrown = false;
  let errorMessages = [];
  // Try aurum first
  try {
    await updateAMBondPrice();
  } catch (error) {
    console.log("Error updating Aurum Bond", error);
    errorThrown = true;
    errorMessages.push(error.message);
  }
  // then raider
  try {
    await updateRMBondPrice();
  } catch (error) {
    console.log("Error updating bond price", error);
    errorThrown = true;
    errorMessages.push(error.message);
  }
  // Did either throw an error?
  if (errorThrown) {
    res.status(500).send(errorMessages);
  } else {
    res.send('ok');
  }   
});

// Start the server
server.listen(3000, ()=>{console.log("Server is Ready!")});
// Log in the discord bot.
RMclient.login(RMbot_secret_token);
AMclient.login(AMbot_secret_token);
