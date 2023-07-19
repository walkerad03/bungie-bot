const logger = require('./modules/logger');
const discord_module = require('./modules/discord');
const destiny = require('./modules/destiny');

module.exports = {
    getLatestActivity: async function (member) {
        const username = member.nickname ?? member.user.username;
        try {
            const membershipDetails = await this.getMembershipByUsername(username);

            const membershipType = membershipDetails[0].membershipType;
            const membershipId = membershipDetails[0].membershipId;
            
            const data = await destiny.getProfile(membershipType, membershipId, [100]);

            const dateLastPlayed = new Date(data.profile.data.dateLastPlayed);
            var currentDate = new Date()
            const TimeSincePlayedDays = (currentDate - dateLastPlayed) / (1000 * 86400);
            if (TimeSincePlayedDays < 7) {
                discord_module.setRole(member, "Active");
            } else {
                discord_module.removeRole(member, "Active");
            }
        } catch (error) {
            logger.logWarn(`Failed time check for ${username}`);
        }
    },

    getMembershipByUsername: async function (username) {
        var data = [];

        let foundMembershipDetails = false;
        let page = 0;
        const [displayName, bungieGlobalDisplayNameCode] = username.split('#');

        try {
            let res = await destiny.searchGlobalName(displayName, page);

            while (!foundMembershipDetails && res !== undefined) {
                for (const result of res.searchResults) {
                    if (result.bungieGlobalDisplayNameCode === parseInt(bungieGlobalDisplayNameCode)) {
                        foundMembershipDetails = true;
                        for (const membership of result.destinyMemberships) {
                            const { membershipId, membershipType } = membership;
                            data.push({
                                membershipId: membershipId,
                                membershipType: membershipType
                            });

                            return data;
                        }
                    }
                }

                page += 1;
                res = await destiny.searchGlobalName(displayName, page);
            }
        }

        catch (error) {
            logger.logWarn(`Could not find membership information for ${username}`);
        }
    },

    getCompletedLowmanRaidsByCharacter: async function (membership_type, membership_id, character_id) {
        var data = [];
        var page = 0;

        while (true) {
            var res = await destiny.getActivityHistory(character_id, membership_id, membership_type, "250", "raid", page);

            if (!("activities" in res)) { return data; }

            for (let i = 0; i < res.activities.length; i++) {
                const activity = res.activities[i];
                if (activity.values.playerCount.basic.value <= 3 && activity.values.completed.basic.value == 1) {

                    const directorActivityHash = activity.activityDetails.directorActivityHash;
                    const activity_definition_res = await destiny.getActivityDefinition(directorActivityHash);

                    data.push({
                        name: activity_definition_res.displayProperties.name,
                        description: activity_definition_res.displayProperties.description,
                        date: activity.period,
                        fireteamSize: parseInt(activity.values.playerCount.basic.value),
                    });
                }
            }
            page++;
        }
    },

    getCharactersByMembership: async function (membership_type, membership_id) {
        const chars_res = await destiny.getAccountStats(membership_type, membership_id);

        var characters = []
        for (const char of chars_res.characters) {
            characters.push(char.characterId);
        }

        return characters;
    }
};