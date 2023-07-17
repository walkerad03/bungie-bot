const { SlashCommandBuilder } = require('discord.js');

const utils = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('return-membership')
		.setDescription('Spits out membership details (for dev purposes)'),
	async execute(interaction) {
		await interaction.deferReply({ephemeral: true});

        const nickname = interaction.member.nickname;

        membership_details = await utils.get_membership_by_username(nickname)
		
		interaction.editReply(`Membership ID: ${membership_details[0].membershipId}\nMembership Type: ${membership_details[0].membershipType}`);
	},
};