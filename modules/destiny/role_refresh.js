axios = require('axios');
const utils = require('../../utils');
const discord_module = require('../discord');

function _checkExists (str, search, member, role) {
    if (str.includes(search)) {
        discord_module.setRole(member, role);
    }
}

module.exports = {
	async roleRefresh(member) {
		const username = member.nickname;

		const membershipDetails = await utils.getMembershipByUsername(username);

		const membershipType = membershipDetails[0].membershipType;
		const membershipId = membershipDetails[0].membershipId;

		const chars = await utils.getMembershipByUsername(membershipType, membershipId);

		var lowmans = [];

		for (idx in chars) {
			const lowmansForChar = await utils.getCompletedLowmanRaidsByCharacter(membershipType, membershipId, chars[idx]);

			lowmans.push(lowmansForChar);
		}

		let completionCounts = {}

		for (i in lowmans) {
			for (let raid of lowmans[i]) {
				if (`${raid.fireteamSize}_${raid.name}` in completionCounts){
					completionCounts[`${raid.fireteamSize}_${raid.name}`] ++;
				} else {
					completionCounts[`${raid.fireteamSize}_${raid.name}`] = 1;
				}
			}
		}

		let str = '';
		for (let key in completionCounts) {
			str += key + ': ' + completionCounts[key] + '\n';
		}

        _checkExists(str, "3_Last Wish", member, "Trio LW");
        _checkExists(str, "3_Garden of Salvation", member, "Trio GoS");
        _checkExists(str, "2_Garden of Salvation", member, "Duo GoS");
        _checkExists(str, "3_Deep Stone Crypt", member, "Trio DSC");
        _checkExists(str, "2_Deep Stone Crypt", member, "Duo DSC");
        _checkExists(str, "3_Vault of Glass: Normal", member, "Trio VoG");
        _checkExists(str, "2_Vault of Glass: Normal", member, "Duo VoG");
        _checkExists(str, "3_Vault of Glass: Master", member, "Trio VoG: Master");
        _checkExists(str, "2_Vault of Glass: Master", member, "Duo VoG: Master");
        _checkExists(str, "3_Vow of the Disciple: Normal", member, "Trio VotD");
        _checkExists(str, "3_Vow of the Disciple: Master", member, "Trio VotD: Master");
        _checkExists(str, "3_King's Fall: Normal", member, "Trio KF");
        _checkExists(str, "2_King's Fall: Normal", member, "Duo KF");
        _checkExists(str, "3_King's Fall: Master", member, "Trio KF: Master");
        _checkExists(str, "2_King's Fall: Master", member, "Duo KF: Master");
        _checkExists(str, "3_Root of Nightmares: Normal", member, "Trio RoN");
        _checkExists(str, "2_Root of Nightmares: Normal", member, "Duo RoN");
        _checkExists(str, "1_Root of Nightmares: Normal", member, "Solo RoN");
        _checkExists(str, "3_Root of Nightmares: Master", member, "Trio RoN: Master");
        _checkExists(str, "2_Root of Nightmares: Master", member, "Duo RoN: Master");
        _checkExists(str, "1_Root of Nightmares: Master", member, "Solo RoN: Master");
	},
};

