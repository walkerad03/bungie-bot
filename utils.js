const axios = require('axios');

const {bungieAPIKey} = require('./config.json');
const HEADERS = {"X-API-KEY": bungieAPIKey};

module.exports = {
    get_membership_by_username: async function(username) {
        var data = [];

        let foundMembershipDetails = false;
        let page = 0;
        const [displayName, bungieGlobalDisplayNameCode] = username.split('#');
        const req_str = `https://www.bungie.net/Platform/User/Search/GlobalName/${page}/`;
        const json_data = {"displayNamePrefix": displayName};

        let res = await axios.post(req_str, json_data, {headers: HEADERS});

        while ('Response' in res.data && !foundMembershipDetails) {
            for (const result of res.data.Response.searchResults) {
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
            const new_req_str = `https://www.bungie.net/Platform/User/Search/GlobalName/${page}/`;
            res = await axios.post(new_req_str, json_data, {headers: HEADERS});
        }
    },

    get_completed_lowman_raids_by_character: async function (membership_type, membership_id, character_id) {
        var data = [];

        var page = 0;
        
        while (true) {
            var path = `https://www.bungie.net/Platform/Destiny2/${membership_type}/Account/${membership_id}/Character/${character_id}/Stats/Activities/?page=${page}&mode=raid&count=250`;
            var res = await axios.get(path, {headers: HEADERS});

            if (!("activities" in res.data.Response)){
                return data;
            }
            
            for (let i = 0; i < res.data.Response.activities.length; i++) {
                const activity = res.data.Response.activities[i];
                if (activity.values.playerCount.basic.value <= 3 && activity.values.completed.basic.value == 1) {

                    const directorActivityHash = activity.activityDetails.directorActivityHash;

                    const activity_definition_path = `https://www.bungie.net/Platform/Destiny2/Manifest/DestinyActivityDefinition/${directorActivityHash}`;
                    const activity_definition_res = await axios.get(activity_definition_path, {headers: HEADERS});

                    data.push({
                        name: activity_definition_res.data.Response.displayProperties.name,
                        description: activity_definition_res.data.Response.displayProperties.description,
                        date: activity.period,
                        fireteamSize: parseInt(activity.values.playerCount.basic.value),
                        raidDef: activity_definition_res.data,
                    });
                }
            }
            page ++;
        }
    },

    get_characters_by_membership: async function (membership_type, membership_id) {
        const char_req_str = `https://www.bungie.net/Platform/Destiny2/${membership_type}/Account/${membership_id}/Stats/`;
        const chars_res = await axios.get(char_req_str, {headers: HEADERS});
        
        var characters = []

        for (const char of chars_res.data.Response.characters) {
            characters.push(char.characterId);
        }

        return characters;
    }
};