var fs = require('fs');
var path = require('path');
var colors = require('colors');
var Promise = require('bluebird');

Promise.promisifyAll(fs);

var projectDir = process.cwd();
var EnoentError = {code: 'ENOENT'};
var authFileName = '.ftpauth';
var confFileName = '.ftpconfig';

function readConfigFile(configFile) {
  var filePath = path.resolve(projectDir, configFile);

  return Promise.resolve(filePath)
    .then(fs.readFileAsync)
    .then(JSON.parse)
    .catch(EnoentError, function() {
      return Promise.reject('File ' + configFile + ' not found at ' + projectDir);
    })
    .catch(SyntaxError, function() {
      return Promise.reject('File ' + filePath + ' is not valid JSON');
    });
}

function checkConfFields(conf) {
  if (conf.host === undefined) {
      return Promise.reject('Field host not found in ' + confFileName);
  } else if (!conf.host) {
    return Promise.reject('Invalid value of field host');
  }

  if (conf.localRoot === undefined) {
    return Promise.reject('Field localRoot not found in ' + confFileName);
  } else if (!conf.localRoot) {
    return Promise.reject('Invalid value of field localRoot');
  }

  if (conf.remoteRoot === undefined) {
    return Promise.reject('Field remoteRoot not found in ' + confFileName);
  } else if (!conf.remoteRoot) {
    return Promise.reject('Invalid value of field remoteRoot');
  }
}

exports.create = function() {
  return Promise.join(readConfigFile(authFileName), readConfigFile(confFileName), function(auth, conf) {
    if (!auth.username || !auth.password) {
      return Promise.reject('Field username or password not found in ' + authFileName);
    }

    var localRootPath = path.join(projectDir, conf.localRoot);
    var isConfInvalid = checkConfFields(conf);

    if (isConfInvalid) {
      return isConfInvalid;
    }

    return fs.statAsync(localRootPath)
      .then(function(stat) {

        if (!stat.isDirectory()) {
          localRootPath + ' is not directory';
        }

        return {
          username: auth.username,
          password: auth.password,
          host: conf.host,
          port: conf.port || 21,
          localRoot: localRootPath,
          remoteRoot: conf.remoteRoot,
          exclude: []
        }
      })
      .catch(function(err) {
        return Promise.reject('Directory ' + localRootPath + ' does not exist');
      });
  });
}