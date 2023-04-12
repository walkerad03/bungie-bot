const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('check-status')
		.setDescription('Confirms that the bot is running!'),
	async execute(interaction) {
		await interaction.reply('Bot is active!');
	},
};
