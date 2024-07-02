const path = require("path");

const appName = path.basename(__dirname);

module.exports = {
  apps: [
    {
      name: appName,
      script: "index.js",
      instances: 1,
      cron_restart: "0 */3 * * *",
    },
  ],
};
