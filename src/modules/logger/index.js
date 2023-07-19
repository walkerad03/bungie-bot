module.exports = {
  logError: function(message) {
    console.error(`[ERROR] ${message}`);
  },

  logInfo: function(message) {
    console.log(`[INFO] ${message}`);
  },

  logWarn: function(message) {
    console.warn(`[WARN] ${message}`);
  },

  logDebug: function(message) {
    console.debug(`[DEBUG] ${message}`);
  },
};
