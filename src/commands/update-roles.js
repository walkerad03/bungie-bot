const {SlashCommandBuilder} = require('discord.js');
axios = require('axios');
const utils = require('../utils');
const logger = require('../modules/logger');
const discordModule = require('../modules/discord');

/**
 * check if a member has a specific lowman clear, and assign a given role if
 * they do.
 * @param {string} str long string with all raid clears
 * @param {string} search string to filter for
 * @param {GuildMember} member member to apply role to if conditional passes.
 * @param {string} role the name of the role to be assigned.
 */
function _checkExists(str, search, member, role) {
  if (str.includes(search)) {
    discordModule.setRole(member, role);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
      .setName('update-roles')
      .setDescription('Applies roles based on low-man raid completions.')
      .addUserOption((option) =>
        option
            .setName('target')
            .setDescription('User to apply roles to')
            .setRequired(true),
      ),
  async execute(interaction) {
    await interaction.deferReply({ephemeral: true});

    const target = interaction.options.getUser('target');
    const member = interaction.guild.members.cache.get(target.id);
    const username = member.nickname;

    logger.logInfo(`Finding lowmans for ${username}`);

    await interaction.editReply('Finding destiny membership...');

    const membershipDetails = await utils.getMembershipByUsername(username);

    const membershipType = membershipDetails[0].membershipType;
    const membershipId = membershipDetails[0].membershipId;

    await interaction.editReply('Pulling characters...');

    const chars = await utils.getCharactersByMembership(
        membershipType,
        membershipId,
    );

    const lowmans = [];

    for (idx in chars) {
      await interaction.editReply(`Finding valid lowman completions for each character... (${idx}/${chars.length})`);
      const lowmansForChar = await utils.getCompletedLowmanRaidsByCharacter(membershipType, membershipId, chars[idx]);

      lowmans.push(lowmansForChar);
    }

    const completionCounts = {};

    for (i in lowmans) {
      for (const raid of lowmans[i]) {
        if (`${raid.fireteamSize}_${raid.name}` in completionCounts) {
          completionCounts[`${raid.fireteamSize}_${raid.name}`] ++;
        } else {
          completionCounts[`${raid.fireteamSize}_${raid.name}`] = 1;
        }
      }
    }

    let str = '';
    for (const key in completionCounts) {
      str += key + ': ' + completionCounts[key] + '\n';
    }

    _checkExists(str, '3_Last Wish', member, 'Trio LW');
    _checkExists(str, '3_Garden of Salvation', member, 'Trio GoS');
    _checkExists(str, '3_Deep Stone Crypt', member, 'Trio DSC');
    _checkExists(str, '2_Deep Stone Crypt', member, 'Duo DSC');
    _checkExists(str, '3_Vault of Glass: Normal', member, 'Trio VoG');
    _checkExists(str, '2_Vault of Glass: Normal', member, 'Duo VoG');
    _checkExists(str, '3_Vault of Glass: Master', member, 'Trio VoG: Master');
    _checkExists(str, '2_Vault of Glass: Master', member, 'Duo VoG: Master');
    _checkExists(str, '3_Vow of the Disciple: Normal', member, 'Trio VotD');
    _checkExists(str, '3_Vow of the Disciple: Master', member, 'Trio VotD: Master');
    _checkExists(str, '3_King\'s Fall: Normal', member, 'Trio KF');
    _checkExists(str, '2_King\'s Fall: Normal', member, 'Duo KF');
    _checkExists(str, '3_King\'s Fall: Master', member, 'Trio KF: Master');
    _checkExists(str, '2_King\'s Fall: Master', member, 'Duo KF: Master');
    _checkExists(str, '3_Root of Nightmares: Normal', member, 'Trio RoN');
    _checkExists(str, '2_Root of Nightmares: Normal', member, 'Duo RoN');
    _checkExists(str, '1_Root of Nightmares: Normal', member, 'Solo RoN');
    _checkExists(str, '3_Root of Nightmares: Master', member, 'Trio RoN: Master');
    _checkExists(str, '2_Root of Nightmares: Master', member, 'Duo RoN: Master');
    _checkExists(str, '1_Root of Nightmares: Master', member, 'Solo RoN: Master');

    await interaction.editReply(`Clears:\n${str}`);
  },
};

