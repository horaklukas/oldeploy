var Promise = require('bluebird');
var colors = require('colors');
var FtpDeploy = require('ftp-deploy');

var ftpDeploy = new FtpDeploy();

var deployAsync = Promise.promisify(ftpDeploy.deploy);

ftpDeploy.on('uploading', function(data) {
    console.log('Deploying', data.filename);
});

ftpDeploy.on('uploaded', function(data) {
    var transferred = data.transferredFileCount + '/' + data.totalFileCount;
    console.log(('Completed ' + transferred + ' files').green);
});

ftpDeploy.on('error', function (data) {
    console.log(data.err.red);
});

module.exports = {
    deploy: deployAsync
}