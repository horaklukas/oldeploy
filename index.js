var colors = require('colors');
var config = require('./src/config');
var ftpDeploy = require('./src/deploy');

config.create()
  .then(ftpDeploy.deploy)
  .then(function() {
    console.log('Deployed!'.green);
  })
  .catch(function(error) {
    console.log(('Error: ' + error + '!').red);
    process.exit(1);
  });