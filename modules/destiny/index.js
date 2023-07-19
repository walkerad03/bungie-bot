const logger = require('../logger');
const {bungieAPIKey} = require('../../config.json');
const HEADERS = {"X-API-KEY": bungieAPIKey};

module.exports = {
    api_get: async function (path) {
        try {
            const response = await axios.get(`https://www.bungie.net${path}`, {headers: HEADERS});
            return response.data.Response;
        } catch (error) {
            logger.logError(`Error sending get request to BUNGIE API\n${error}`);
            throw error;
        }
    },

    api_post: async function (path, post_data) {
        try {
            const response = await axios.post(`https://www.bungie.net${path}`, post_data, {headers: HEADERS});
            return response.data.Response;
        } catch (error) {
            logger.logError(`Error sending post request to BUNGIE API\n${error}`);
            throw error;
        }
    },

    get_pgcr: async function (activity_id) {
        if (Number.isInteger(activity_id)) {
            return await this.api_get(`/Platform/Destiny2/Stats/PostGameCarnageReport/${activity_id}`);
        } else {
            logger.logError(`activity_id was not an integer (${activity_id})`);
            return;
        }
    }, 

    get_activity_definition: async function (director_activity_hash) {
        if (Number.isInteger(director_activity_hash)) {
            return await this.api_get(`/Platform/Destiny2/Manifest/DestinyActivityDefinition/${director_activity_hash}`);
        } else {
            logger.logError(`director_activity_hash was not an integer (${director_activity_hash})`);
            return;
        }
    },

    /**
     * Return a user destiny profile from membership hash.
     * @param {*} membership_type describe the type of membership by platform
     * @param {*} membership_id unique membership hash
     * @returns profile from Bungie API
     */
    get_profile: async function (membership_type, membership_id) {
        if (!typeof membership_type === "string") {
            logger.logError(`membership_type is not a string (${membership_type})`);
            return;
        }
        if (!typeof membership_id === "string") {
            logger.logError(`membership_id is not a string (${membership_id})`);
            return;
        } 
        return await this.api_get(`/Platform/Destiny2/${membership_type}/Account/${membership_id}/Stats/`);
    },

    searchGlobalName: async function (displayName, page) {
        if (!typeof displayName === "string") {
            logger.logError(`display name must be a string (${displayName})`);
            return;
        } 
        if (!typeof page === "string") {
            logger.logError(`page must be a string (${page})`);
            return;
        }
        const json_data = { "displayNamePrefix": displayName };
        return await this.api_post(
            `/Platform/User/Search/GlobalName/${page}/`,
            json_data
        );
    },
}