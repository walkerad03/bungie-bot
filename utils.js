const axios = require('axios');

const {bungieAPIKey} = require('./config.json');
const HEADERS = {"X-API-KEY": bungieAPIKey};
const logger = require(`./logger`);

module.exports = {
    get_membership_by_username: async function(username) {
        var data = [];

        let foundMembershipDetails = false;
        let page = 0;
        const [displayName, bungieGlobalDisplayNameCode] = username.split('#');
        const json_data = {"displayNamePrefix": displayName};

        let res = await this.bungie_api_post(
            `/Platform/User/Search/GlobalName/${page}/`,
            json_data
        );

        while (!foundMembershipDetails && res !== undefined) {
            for (const result of res.searchResults) {
                if (result.bungieGlobalDisplayNameCode === parseInt(bungieGlobalDisplayNameCode)) {
                    foundMembershipDetails = true;
                    for (const membership of result.destinyMemberships) {
                    const {membershipId, membershipType} = membership;
                    data.push({
                        membershipId: membershipId,
                        membershipType: membershipType
                    });

                    return data;
                    }
                }
            }

            page += 1;
            res = await this.bungie_api_post(
                `/Platform/User/Search/GlobalName/${page}/`,
                json_data
            );
        }
    },

    get_completed_lowman_raids_by_character: async function (membership_type, membership_id, character_id) {
        var data = [];
        var page = 0;
        
        while (true) {
            var res = await this.bungie_api_get(
                `/Platform/Destiny2/${membership_type}/Account/${membership_id}/Character/${character_id}/Stats/Activities/?page=${page}&mode=raid&count=250`
            );

            if (!("activities" in res)){ return data; }
            
            for (let i = 0; i < res.activities.length; i++) {
                const activity = res.activities[i];
                if (activity.values.playerCount.basic.value <= 3 && activity.values.completed.basic.value == 1) {

                    const directorActivityHash = activity.activityDetails.directorActivityHash;
                    const activity_definition_res = await this.bungie_api_get(
                        `/Platform/Destiny2/Manifest/DestinyActivityDefinition/${directorActivityHash}`
                    );

                    data.push({
                        name: activity_definition_res.displayProperties.name,
                        description: activity_definition_res.displayProperties.description,
                        date: activity.period,
                        fireteamSize: parseInt(activity.values.playerCount.basic.value),
                    });
                }
            }
            page ++;
        }
    },

    get_characters_by_membership: async function (membership_type, membership_id) {
        const chars_res = await this.bungie_api_get(
            `/Platform/Destiny2/${membership_type}/Account/${membership_id}/Stats/`
        );

        var characters = []
        for (const char of chars_res.characters) {
            characters.push(char.characterId);
        }

        return characters;
    },

    bungie_api_get: async (path) => {
        try {
            const response = await axios.get(`https://www.bungie.net${path}`, {headers: HEADERS});
            return response.data.Response;
        } catch (error) {
            logger.logError(`Error sending get request to BUNGIE API\n${error}`);
            throw error;
        }
    },

    bungie_api_post: async (path, post_data) => {
        try {
            const response = await axios.post(`https://www.bungie.net${path}`, post_data, {headers: HEADERS});
            return response.data.Response;
        } catch (error) {
            logger.logError(`Error sending post request to BUNGIE API\n${error}`);
            throw error;
        }
    }
};