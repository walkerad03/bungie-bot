const logger = require('../logger');
const {bungieAPIKey} = require('../../config.json');
const HEADERS = {"X-API-KEY": bungieAPIKey};

/**
     * Simple async function to make a get request to the Bungie API. Returns a json object containing the response data.
     * @param {string} path endpoint to send to Bungie API
     * @returns json data containing response.
     */
async function _apiGet (path) {
    try {
        const response = await axios.get(`https://www.bungie.net${path}`, {headers: HEADERS});
        return response.data.Response;
    } catch (error) {
        logger.logError(`Error sending get request to BUNGIE API\n${error}`);
        throw error;
    }
}

/**
 * Async function to make post request to Bungie API
 * @param {string} path endpoint to append to https://www.bungie.net
 * @param {JSON} postData additional data to add to request
 * @returns json data containing response.
 */
async function _apiPost (path, postData) {
    try {
        const response = await axios.post(`https://www.bungie.net${path}`, postData, {headers: HEADERS});
        return response.data.Response;
    } catch (error) {
        logger.logError(`Error sending post request to BUNGIE API\n${error}`);
        throw error;
    }
}

module.exports = {
    /**
     * async function to return post game carnage reports.
     * @param {string} activityId A unique hash representing a specific activity
     * @returns json data with response.
     */
    getPGCR: async function (activityId) {
        if (Number.isInteger(activityId)) {
            return await _apiGet(`/Platform/Destiny2/Stats/PostGameCarnageReport/${activityId}`);
        } else {
            logger.logError(`activity_id was not an integer (${activityId})`);
            return;
        }
    }, 

    /**
     * async function to details for a specific type of activity.
     * @param {string} directorActivityHash unique hash representing a specific activity type
     * @returns json data with response
     */
    getActivityDefinition: async function (directorActivityHash) {
        if (Number.isInteger(directorActivityHash)) {
            return await _apiGet(`/Platform/Destiny2/Manifest/DestinyActivityDefinition/${directorActivityHash}`);
        } else {
            logger.logError(`director_activity_hash was not an integer (${directorActivityHash})`);
            return;
        }
    },

    /**
     * Return a user destiny profile stats from membership hash.
     * @param {*} membershipType describe the type of membership by platform
     * @param {*} membershipId unique membership hash
     * @returns profile from Bungie API
     */
    getAccountStats: async function (membershipType, membershipId) {
        if (!typeof membershipType === "string") {
            logger.logError(`membership_type is not a string (${membershipType})`);
            return;
        }
        if (!typeof membershipId === "string") {
            logger.logError(`membership_id is not a string (${membershipId})`);
            return;
        } 
        return await _apiGet(`/Platform/Destiny2/${membershipType}/Account/${membershipId}/Stats/`);
    },

    /**
     * return 1 page of display name search results.
     * @param {string} displayName user's display name, excluding ID number.
     * @param {string} page page index to return.
     * @returns json data given a specific page.
     */
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
        return await _apiPost(
            `/Platform/User/Search/GlobalName/${page}/`,
            json_data
        );
    },

    /**
     * 
     * @param {string} membershipType describe the type of platform the membership exists on
     * @param {string} membershipId unique membership hash
     * @param {Array} components list of components to send to the request.
     * @returns 
     */
    getProfile: async function (membershipType, membershipId, components = []) {
        const componentStr = components.join(',');
        return await _apiGet(`/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=${componentStr}`);
    },

    /**
     * return a list of activities for a given character.
     * @param {string} characterId unique character hash
     * @param {string} membershipId unique membership hash
     * @param {string} membershipType membership type identifier
     * @param {string} count number of results to return per page
     * @param {string} mode activity type to search
     * @param {string} page page index to return.
     * @returns json data containing list of activities.
     */
    getActivityHistory: async function (characterId, membershipId, membershipType, count, mode, page) {
        return await destiny.api_get(
            `/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?page=${page}&mode=${mode}&count=${count}`
        );
    },
}