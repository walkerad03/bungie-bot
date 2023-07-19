const logger = require('../logger');

module.exports = {
  setRole: async function(member, roleName) {
    const role = member.guild.roles.cache.find((r) => r.name === roleName);

    if (!role) {
      logger.logWarn(`Role "${roleName}" not found.`);
      return;
    }

    if (member.roles.cache.has(role.id)) {
      return;
    }

    try {
      await member.roles.add(role);
      logger.logInfo(`Added role ${roleName} to user ${member.nickname}`);
    } catch (error) {
      logger.logError(`Failed to assign role "${roleName}" to user "${member.nickname}": ${error}`);
    }
  },

  removeRole: async function(member, roleName) {
    const role = member.guild.roles.cache.find((r) => r.name === roleName);

    if (!role) {
      logger.logWarn(`Role "${roleName}" not found.`);
      return;
    }

    if (!member.roles.cache.has(role.id)) {
      return;
    }

    try {
      await member.roles.remove(role);
      logger.logInfo(`Removed role ${roleName} from ${member.nickname}`);
    } catch (error) {
      logger.logError(`Failed to remove role "${roleName}" from user "${member.nickname}": ${error}`);
    }
  },
};
