const bot = require('./src');
const logger = require('./src/modules/logger');

bot.init();
bot.login();
logger.logInfo('bot started');
