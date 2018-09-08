var config = require('./src/config');
var ftpDeploy = require('./src/deploy');

module.exports = {
  createConfig: config.create,
  deploy: ftpDeploy.deploy
};