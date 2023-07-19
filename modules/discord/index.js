const logger = require('../logger');

module.exports = {
    setRole: async function (member, role_name) {
        const role = member.guild.roles.cache.find((r) => r.name === role_name);

        if (!role) {
            logger.logWarn(`Role "${role_name}" not found.`);
            return;
        }

        if (member.roles.cache.has(role.id)) {
            return;
        }

        try {
            await member.roles.add(role);
            logger.logInfo(`Added role ${role_name} to user ${member.nickname}`);
        }
        catch (error) {
            logger.logError(`Failed to assign role "${role_name}" to user "${member.nickname}": ${error}`);
        }
    },

    removeRole: async function (member, role_name) {
        const role = member.guild.roles.cache.find((r) => r.name === role_name);

        if (!role) {
            logger.logWarn(`Role "${role_name}" not found.`);
            return;
        }

        if (!member.roles.cache.has(role.id)) {
            return;
        }

        try {
            await member.roles.remove(role);
            logger.logInfo(`Removed role ${role_name} from ${member.nickname}`);
        }
        catch (error) {
            logger.logError(`Failed to remove role "${role_name}" from user "${member.nickname}": ${error}`);
        }
    }
}