const { SlashCommandBuilder, messageLink, isValidationEnabled } = require('discord.js');

const {bungieAPIKey} = require('../config.json');

async function get_lowmans_for_member(mem_type, mem_id) {
	response = await fetch(`https://www.bungie.net/Platform/Destiny2/${mem_type}/Account/${mem_id}/Stats/`, {
		method: "get",
		headers: {'X-API-KEY': bungieAPIKey}
	});

	res = await response.json();
	chars = await res.Response.characters;

	const valid_lowman_raids = {
		"clears": []
	};

	for (var i = 0; i < chars.length; i++) {
		selected = chars[i].characterId;
		res = await fetch(`https://www.bungie.net/Platform/Destiny2/${mem_type}/Account/${mem_id}/Character/${selected}/Stats/Activities/?page=0&mode=raid&count=250`, {
			method: "get",
			headers: {'X-API-KEY': bungieAPIKey}
		});

		activities = await res.json();
		activities = activities.Response.activities
		
		for (var i = 0; i < activities.length; i++) {
			var activity = activities[i];
			p_count = activity.values.playerCount.basic.value;
			completed = activity.values.completed.basic.value;
			if (completed == 1 && p_count <= 3) {
				valid_lowman_raids.clears.push(activity);
			}
		}
	}
	return valid_lowman_raids;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update-roles')
		.setDescription('Refreshes roles for a user. Make sure your server nickname matches your bungie name!'),
	async execute(interaction) {

		await interaction.deferReply();
		
		const nickname = interaction.member.nickname;
		const name_arr = nickname.split("#");
		const username = name_arr[0];
		const number = Number(name_arr[1]);

		var foundMemberInfo = false;
		var page = 0;

		const body = {"displayNamePrefix": username}

		while (!foundMemberInfo) {
			response = await fetch(`https://www.bungie.net/Platform/User/Search/GlobalName/${page}/`, {
				method: 'post',
				body: JSON.stringify(body),
				headers: {'Content-Type': 'application/json', 'X-API-KEY': bungieAPIKey}
			});
	
			data = await response.json();
	
			for (var i = 0; i < data.Response.searchResults.length; i++) {
				var member = data.Response.searchResults[i];
				if (member.bungieGlobalDisplayNameCode == number) {
					foundMemberInfo = true;
					console.log("Found member info.")					
					deets = get_lowmans_for_member(member.destinyMemberships[0].membershipType, member.destinyMemberships[0].membershipId);

					console.log(deets)
					//console.log(deets)

					break;
				}
			}

			page ++;
		}
		
		
		await interaction.editReply(`${deets}`);
	},
};
