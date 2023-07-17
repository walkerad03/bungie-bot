axios = require('axios');
const utils = require('../../utils');
const discord_module = require('../discord');

_check_exists = function (str, search, member, role) {
    if (str.includes(search)) {
        discord_module.set_role(member, role);
    }
}

module.exports = {
	async role_refresh(member) {
		const username = member.nickname;

		const membership_details = await utils.get_membership_by_username(username);

		const membership_type = membership_details[0].membershipType;
		const membership_id = membership_details[0].membershipId;

		const chars = await utils.get_characters_by_membership(membership_type, membership_id);

		var lowmans = [];

		for (idx in chars) {
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

        _check_exists(str, "3_Last Wish", member, "Trio LW");
        _check_exists(str, "3_Garden of Salvation", member, "Trio GoS");
        _check_exists(str, "2_Garden of Salvation", member, "Duo GoS");
        _check_exists(str, "3_Deep Stone Crypt", member, "Trio DSC");
        _check_exists(str, "2_Deep Stone Crypt", member, "Duo DSC");
        _check_exists(str, "3_Vault of Glass: Normal", member, "Trio VoG");
        _check_exists(str, "2_Vault of Glass: Normal", member, "Duo VoG");
        _check_exists(str, "3_Vault of Glass: Master", member, "Trio VoG: Master");
        _check_exists(str, "2_Vault of Glass: Master", member, "Duo VoG: Master");
        _check_exists(str, "3_Vow of the Disciple: Normal", member, "Trio VotD");
        _check_exists(str, "3_Vow of the Disciple: Master", member, "Trio VotD: Master");
        _check_exists(str, "3_King's Fall: Normal", member, "Trio KF");
        _check_exists(str, "2_King's Fall: Normal", member, "Duo KF");
        _check_exists(str, "3_King's Fall: Master", member, "Trio KF: Master");
        _check_exists(str, "2_King's Fall: Master", member, "Duo KF: Master");
        _check_exists(str, "3_Root of Nightmares: Normal", member, "Trio RoN");
        _check_exists(str, "2_Root of Nightmares: Normal", member, "Duo RoN");
        _check_exists(str, "1_Root of Nightmares: Normal", member, "Solo RoN");
        _check_exists(str, "3_Root of Nightmares: Master", member, "Trio RoN: Master");
        _check_exists(str, "2_Root of Nightmares: Master", member, "Duo RoN: Master");
        _check_exists(str, "1_Root of Nightmares: Master", member, "Solo RoN: Master");
	},
};

