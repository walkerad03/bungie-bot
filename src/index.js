// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const {Client, Collection, Events, GatewayIntentBits, ActivityType} = require('discord.js');
const {token, guildId} = require('../config.json');
const logger = require('./modules/logger');
const utils = require('./utils.js');
const {roleRefresh} = require('./modules/destiny/role_refresh');

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

/**
 * set roles for all server members.
 */
async function setActivities() {
  const guild = client.guilds.cache.get(guildId);
  guild.members.cache.each((member) => {
    const nickname = member.nickname ?? member.user.username;
    const regexPattern = /^[^#]+#\d+$/;
    if (nickname === 'shy#8600') {

    } else if (regexPattern.test(nickname)) {
      utils.getLatestActivity(member);
      roleRefresh(member);
    }
  });
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already
// defined 'client'
client.once('ready', (c) => {
  logger.logInfo(`Ready! Logged in as ${c.user.tag}`);

  setActivities();

  setInterval(setActivities, 30 * 60 * 1000);
  client.user.setActivity('you.', {type: ActivityType.Watching});
  client.user.setStatus('online');
});

client.on('error', function(msg) {
  logger.logError(msg);
});

client.on('warn', function(msg) {
  logger.logWarn(msg);
});

client.on('debug', function(msg) {
  logger.logDebug(msg);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }
});

/**
 * initializes the discord bot.
 */
function init() {
  client.commands = new Collection();

  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      logger.logWarn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

/**
 * connect bot to discord server.
 */
function login() {
  client.login(token);
}

module.exports.init = init;
module.exports.login = login;
