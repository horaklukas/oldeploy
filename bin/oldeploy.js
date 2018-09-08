#! /usr/bin/env node

var colors = require('colors');
var Promise = require('bluebird');
var oldeploy = require('../');

Promise.try(function() {
	return oldeploy.createConfig();
})
.then(oldeploy.deploy)
.then(function() {
	console.log('Deployed!'.green);
})
.catch(function(error) {
	console.log(('Error: ' + error + '!').red);
	process.exit(1);
});