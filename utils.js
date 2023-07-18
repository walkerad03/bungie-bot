const logger = require('./modules/logger');
const discord_module = require('./modules/discord');
const destiny = require('./modules/destiny');

module.exports = {
    get_latest_activity: async function (member) {
        const username = member.nickname ?? member.user.username;
        try {
            const mem_details = await this.get_membership_by_username(username);

            const membership_type = mem_details[0].membershipType;
            const membership_id = mem_details[0].membershipId;

            const data = await destiny.api_get(
                `/Platform/Destiny2/${membership_type}/Profile/${membership_id}/?components=100`,
            );

            const date_last_played = new Date(data.profile.data.dateLastPlayed);
            var current_date = new Date()
            const time_since_played = (current_date - date_last_played) / (1000 * 86400);
            if (time_since_played < 7) {
                discord_module.set_role(member, "Active");
                if (time_since_played < 0.006944444) {
                    discord_module.set_role(member, "Online");
                } else {
                    discord_module.remove_role(member, "Online");
                }
            } else {
                discord_module.remove_role(member, "Active");
            }
        } catch (error) {
            logger.logWarn(`Failed time check for ${username}`);
        }
    },

    get_membership_by_username: async function (username) {
        var data = [];

        let foundMembershipDetails = false;
        let page = 0;
        const [displayName, bungieGlobalDisplayNameCode] = username.split('#');
        const json_data = { "displayNamePrefix": displayName };

        try {
            let res = await destiny.api_post(
                `/Platform/User/Search/GlobalName/${page}/`,
                json_data
            );

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
                res = await destiny.api_post(
                    `/Platform/User/Search/GlobalName/${page}/`,
                    json_data
                );
            }
        }

        catch (error) {
            logger.logWarn(`Could not find membership information for ${username}`);
        }
    },

    get_completed_lowman_raids_by_character: async function (membership_type, membership_id, character_id) {
        var data = [];
        var page = 0;

        while (true) {
            var res = await destiny.api_get(
                `/Platform/Destiny2/${membership_type}/Account/${membership_id}/Character/${character_id}/Stats/Activities/?page=${page}&mode=raid&count=250`
            );

            if (!("activities" in res)) { return data; }

            for (let i = 0; i < res.activities.length; i++) {
                const activity = res.activities[i];
                if (activity.values.playerCount.basic.value <= 3 && activity.values.completed.basic.value == 1) {

                    const directorActivityHash = activity.activityDetails.directorActivityHash;
                    const activity_definition_res = await destiny.get_activity_definition(directorActivityHash);

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

    get_characters_by_membership: async function (membership_type, membership_id) {
        const chars_res = await destiny.get_profile(membership_type, membership_id);

        var characters = []
        for (const char of chars_res.characters) {
            characters.push(char.characterId);
            //logger.logInfo(`Found character ${char.characterId}`);
        }

        return characters;
    }
};