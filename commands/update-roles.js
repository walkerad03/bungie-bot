const { SlashCommandBuilder } = require('discord.js');
axios = require('axios');
const utils = require('../utils');
const logger = require('../modules/logger');
const discord_module = require('../modules/discord');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update-roles')
		.setDescription('Applies roles based on low-man raid completions. BROKEN!')
		.addUserOption((option) =>
			option
				.setName('target')
				.setDescription('User to apply roles to')
				.setRequired(true)
		),
	async execute(interaction) {
		await interaction.deferReply({ephemeral: true});

		const target = interaction.options.getUser('target');
		const member = interaction.guild.members.cache.get(target.id);
		const username = member.nickname;

		logger.logInfo(`Finding lowmans for ${username}`);

		await interaction.editReply("Finding destiny membership...");

		const membership_details = await utils.get_membership_by_username(username);

		const membership_type = membership_details[0].membershipType;
		const membership_id = membership_details[0].membershipId;

		await interaction.editReply("Pulling characters...");

		const chars = await utils.get_characters_by_membership(membership_type, membership_id);

		var lowmans = [];

		for (idx in chars) {
			await interaction.editReply(`Finding valid lowman completions for each character... (${idx}/${chars.length})`);
			const lowmans_for_char = await utils.get_completed_lowman_raids_by_character(membership_type, membership_id, chars[idx]);

			lowmans.push(lowmans_for_char);
		}

		completion_counts = {}

		for (i in lowmans) {
			for (let raid of lowmans[i]) {
				if (`${raid.fireteamSize}_${raid.name}` in completion_counts){
					completion_counts[`${raid.fireteamSize}_${raid.name}`] ++;
				} else {
					completion_counts[`${raid.fireteamSize}_${raid.name}`] = 1;
				}
			}
		}

		let str = '';
		for (let key in completion_counts) {
			str += key + ': ' + completion_counts[key] + '\n';
		}

		if (str.includes("3_Garden of Salvation")) {
			discord_module.set_role(member, "Trio GoS");
		}
		if (str.includes("3_Deep Stone Crypt")) {
			discord_module.set_role(member, "Trio DSC");
		}
		if (str.includes("3_Vault of Glass: Normal")) {
			discord_module.set_role(member, "Trio VoG");
		}
		if (str.includes("3_Root of Nightmares: Normal")) {
			discord_module.set_role(member, "Trio RoN");
		}
		if (str.includes("3_King's Fall: Normal")) {
			discord_module.set_role(member, "Trio KF");
		}
		if (str.includes("3_Vow of the Disciple: Normal")) {
			discord_module.set_role(member, "Trio VotD");
		}
		if (str.includes("2_King's Fall: Normal")) {
			discord_module.set_role(member, "Duo KF");
		}
		if (str.includes("2_Deep Stone Crypt")) {
			discord_module.set_role(member, "Duo DSC");
		}

		await interaction.editReply(`Clears:\n${str}`);
	},
};

