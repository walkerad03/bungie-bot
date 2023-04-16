const { SlashCommandBuilder } = require('discord.js');
axios = require('axios');
const utils = require('../utils');

const {bungieAPIKey} = require('../config.json');
const HEADERS = {"X-API-KEY": bungieAPIKey};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update-roles')
		.setDescription('Applies roles based on high-level achievements such as lowman raids, solo dungeons, and other shit'),
	async execute(interaction) {
		await interaction.deferReply({ephemeral: true});

		const username = interaction.member.nickname;

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

		await interaction.editReply(str);

		if ("3_Vault of Glass: Normal" in completion_counts) {
			
			// TODO: Add role assignments.

			await interaction.followUp({content: "Added Trio VoG Role!", ephemeral: true});
		}
	},
};

