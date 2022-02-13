const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const botStart = require("./bots.js");
const keepAlive = require('./server');

const client = botStart();
keepAlive();
const bot_secret_token = process.env.RMbondBot;
client.login(bot_secret_token);
