const logger = require('./modules/logger');
const discordModule = require('./modules/discord');
const destiny = require('./modules/destiny');

module.exports = {
  getLatestActivity: async function(member) {
    const username = member.nickname ?? member.user.username;
    try {
      const membershipDetails = await this.getMembershipByUsername(username);

      const membershipType = membershipDetails[0].membershipType;
      const membershipId = membershipDetails[0].membershipId;

      const data = await destiny.getProfile(membershipType, membershipId, [100]);

      const dateLastPlayed = new Date(data.profile.data.dateLastPlayed);
      const currentDate = new Date();
      const TimeSincePlayedDays = (currentDate - dateLastPlayed) / (1000 * 86400);
      if (TimeSincePlayedDays < 7) {
        discordModule.setRole(member, 'Active');
      } else {
        discordModule.removeRole(member, 'Active');
      }
    } catch (error) {
      logger.logWarn(`Failed time check for ${username}`);
    }
  },

  getMembershipByUsername: async function(username) {
    const data = [];

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
              const {membershipId, membershipType} = membership;
              data.push({
                membershipId: membershipId,
                membershipType: membershipType,
              });

              return data;
            }
          }
        }

        page += 1;
        res = await destiny.searchGlobalName(displayName, page);
      }
    } catch (error) {
      logger.logWarn(`Could not find membership information for ${username}`);
    }
  },

  getCompletedLowmanRaidsByCharacter: async function(membershipType, membershipId, characterId) {
    const data = [];
    let page = 0;

    while (true) {
      const res = await destiny.getActivityHistory(characterId, membershipId, membershipType, '250', 'raid', page);

      if (!('activities' in res)) {
        return data;
      }

      for (let i = 0; i < res.activities.length; i++) {
        const activity = res.activities[i];
        if (activity.values.playerCount.basic.value <= 3 && activity.values.completed.basic.value == 1) {
          const directorActivityHash = activity.activityDetails.directorActivityHash;
          const activityDefinitionRes = await destiny.getActivityDefinition(directorActivityHash);

          data.push({
            name: activityDefinitionRes.displayProperties.name,
            description: activityDefinitionRes.displayProperties.description,
            date: activity.period,
            fireteamSize: parseInt(activity.values.playerCount.basic.value),
          });
        }
      }
      page++;
    }
  },

  getCharactersByMembership: async function(membershipType, membershipId) {
    const charRes = await destiny.getAccountStats(membershipType, membershipId);

    const characters = [];
    for (const char of charRes.characters) {
      characters.push(char.characterId);
    }

    return characters;
  },
};
