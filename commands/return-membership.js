const { SlashCommandBuilder } = require('discord.js');

const utils = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('return-membership')
		.setDescription('Spits out membership details (for dev purposes)'),
	async execute(interaction) {
		await interaction.deferReply({ephemeral: true});

        const nickname = interaction.member.nickname;

        const membershipDetails = await utils.getMembershipByUsername(nickname)
		
		interaction.editReply(`Membership ID: ${membershipDetails[0].membershipId}\nMembership Type: ${membershipDetails[0].membershipType}`);
	},
};