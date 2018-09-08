var fs = require('fs');
var path = require('path');
var colors = require('colors');
var Promise = require('bluebird');

Promise.promisifyAll(fs);

var projectDir = process.cwd();
var EnoentError = {code: 'ENOENT'};
var authFileName = '.ftpauth';
var confFileName = '.ftpconfig';

exports.create = function() {
	return Promise.try(function() {
	  return Promise.all([
	      readConfigFile(authFileName).then(checkAuthConfFields),
          readConfigFile(confFileName).then(checkFtpConfFields)
      ]);
    }).spread(function(auth, conf) {
		var localRootPath = path.join(projectDir, conf.localRoot);

		return fs.statAsync(localRootPath)
			.then(function(stat) {
				if (!stat.isDirectory()) {
					throw localRootPath + ' is not directory';
				}

				return {
					username: auth.username,
					password: auth.password,
					host: conf.host,
					port: conf.port || 21,
					localRoot: localRootPath,
					remoteRoot: conf.remoteRoot,
					exclude: conf.exclude || []
				}
			})
			.catch(EnoentError, function() {
				throw 'Directory ' + localRootPath + ' does not exist';
			});
	});
};

function readConfigFile(configFile) {
	return Promise.try(function() {
		return path.resolve(projectDir, configFile);
	})
		.then(fs.readFileAsync)
		.then(JSON.parse)
		.catch(EnoentError, function() {
			throw 'File ' + configFile + ' not found at ' + projectDir;
		})
		.catch(SyntaxError, function() {
			throw 'File ' + path.resolve(projectDir, configFile) + ' is not valid JSON';
		});
}

function checkAuthConfFields(conf) {
	if (!conf.username || !conf.password) {
		throw 'Field username or password not found in ' + authFileName;
	}

	return conf;
}

function checkFtpConfFields(conf) {
	if (conf.host === undefined) {
		throw 'Field host not found in ' + confFileName;
	} else if (!conf.host) {
		throw 'Invalid value of field host';
	}

	if (conf.localRoot === undefined) {
		throw 'Field localRoot not found in ' + confFileName;
	} else if (!conf.localRoot) {
		throw 'Invalid value of field localRoot';
	}

	if (conf.remoteRoot === undefined) {
		throw 'Field remoteRoot not found in ' + confFileName;
	} else if (!conf.remoteRoot) {
		throw 'Invalid value of field remoteRoot';
	}

	return conf;
}