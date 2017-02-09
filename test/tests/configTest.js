var path = require('path');
var mockery = require('mockery');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('Config', function() {
	var config;

	var cwd = process.cwd(),
		authConfigFilePath = path.resolve(cwd, '.ftpauth'),
		ftpConfigFilePath = path.resolve(cwd, '.ftpconfig');
	var validAuthConf = '{"username": "bar", "password": "pass"}',
		validFtpConf = '{"host": "baz", "localRoot": "bar", "remoteRoot": "foo"}',
		localRootPath = path.join(cwd, JSON.parse(validFtpConf).localRoot);

	var mocks = {
		fs: {
			readFile: sinon.stub(),
			stat: sinon.stub()
		}
	};

	before(function () {
		mockery.enable();
		mockery.registerAllowables(['path', 'bluebird', 'colors', '../../src/config']);
		mockery.registerMock('fs', mocks.fs);

		config = require('../../src/config');
	});

	beforeEach(function() {
		mocks.fs.readFile.reset();
		mocks.fs.readFile.withArgs(ftpConfigFilePath).yields(null, validFtpConf);
		mocks.fs.readFile.withArgs(authConfigFilePath).yields(null, validAuthConf);
	});

	describe('read .auth file', function () {
		it('should fail when not found', function (done) {
			mocks.fs.readFile.withArgs(authConfigFilePath).yields({code: 'ENOENT'});

			expect(config.create()).to.be.rejectedWith('File .ftpauth not found at ' + cwd).notify(done);
		});

		it('should fail when not valid json', function (done) {
			mocks.fs.readFile.withArgs(authConfigFilePath).yields(null, '{ble: true}');

			expect(config.create()).to.be.rejectedWith('File ' + authConfigFilePath+ ' is not valid JSON').notify(done);
		});

		it('should fail when there is other error when reading', function(done) {
			mocks.fs.readFile.withArgs(authConfigFilePath).yields({code: 'EPERM', message: 'Not permited'});

			expect(config.create()).to.be.rejectedWith('Not permited').notify(done);
		});
	});

	describe('read .ftpconfig file', function () {
		it('should fail when not found', function (done) {
			mocks.fs.readFile.withArgs(ftpConfigFilePath).yields({code: 'ENOENT'});

			expect(config.create()).to.be.rejectedWith('File .ftpconfig not found at ' + cwd).notify(done);
		});

		it('should fail when not valid json', function (done) {
			mocks.fs.readFile.withArgs(ftpConfigFilePath).yields(null, '{ble: true}');

			expect(config.create()).to.be.rejectedWith('File ' + path.resolve(cwd, '.ftpconfig') + ' is not valid JSON').notify(done);
		});

		it('should fail when there is other error when reading', function(done) {
			mocks.fs.readFile.withArgs(ftpConfigFilePath).yields({code: 'EPERM', message: 'Not permited'});

			expect(config.create()).to.be.rejectedWith('Not permited').notify(done);
		});
	});

	describe('create config', function () {
		it('should fail when username field is not present at .ftpauth', function(done) {
			mocks.fs.readFile.withArgs(ftpConfigFilePath).yields(null, validFtpConf);
			mocks.fs.readFile.withArgs(authConfigFilePath).yields(null, '{"password": "foo"}');

			expect(config.create()).to.be.rejectedWith('Field username or password not found in .ftpauth').notify(done);
		});

		it('should fail when password field is not present at .ftpauth', function(done) {
			mocks.fs.readFile.withArgs(ftpConfigFilePath).yields(null, validFtpConf);
			mocks.fs.readFile.withArgs(authConfigFilePath).yields(null, '{"username": "bar"}');

			expect(config.create()).to.be.rejectedWith('Field username or password not found in .ftpauth').notify(done);
		});

		it('should fail when host field is not present there', function(done) {
			mocks.fs.readFile.withArgs(authConfigFilePath).yields(null, validAuthConf);
			mocks.fs.readFile.withArgs(ftpConfigFilePath).yields(null, '{"localRoot": "bar", "remoteRoot": "foo"}');

			expect(config.create()).to.be.rejectedWith('Field host not found in .ftpconfig').notify(done);
		});

		it('should fail when localRoot field is not present there', function(done) {
			mocks.fs.readFile.withArgs(authConfigFilePath).yields(null, validAuthConf);
			mocks.fs.readFile.withArgs(ftpConfigFilePath).yields(null, '{"host": "baz", "remoteRoot": "foo"}');

			expect(config.create()).to.be.rejectedWith('Field localRoot not found in .ftpconfig').notify(done);
		});

		it('should fail when remoteRoot field is not present there', function(done) {
			mocks.fs.readFile.withArgs(authConfigFilePath).yields(null, validAuthConf);
			mocks.fs.readFile.withArgs(ftpConfigFilePath).yields(null, '{"host": "baz", "localRoot": "bar"}');

			expect(config.create()).to.be.rejectedWith('Field remoteRoot not found in .ftpconfig').notify(done);
		});

		it('should fail when cannot stat localRoot path', function(done) {
			mocks.fs.readFile.withArgs(authConfigFilePath).yields(null, validAuthConf);
			mocks.fs.readFile.withArgs(ftpConfigFilePath).yields(null, validFtpConf);
			mocks.fs.stat.withArgs(localRootPath).yields({code: 'ENOENT'});

			expect(config.create()).to.be.rejectedWith('Directory ' + localRootPath + ' does not exist').notify(done);
		});

		it('should fail when localRoot path is not a directory', function(done) {
			mocks.fs.readFile.withArgs(authConfigFilePath).yields(null, validAuthConf);
			mocks.fs.readFile.withArgs(ftpConfigFilePath).yields(null, validFtpConf);
			mocks.fs.stat.withArgs(localRootPath).yields(null, {isDirectory: sinon.stub().returns(false)});

			expect(config.create()).to.be.rejectedWith(localRootPath + ' is not directory').notify(done);
		});

		it('should create config object', function(done) {
			var parsedAuthConf = JSON.parse(validAuthConf),
				parsedFtpConf = JSON.parse(validFtpConf),
				conf = {
					username: parsedAuthConf.username,
					password: parsedAuthConf.password,
					host: parsedFtpConf.host,
					port: 21,
					localRoot: localRootPath,
					remoteRoot: parsedFtpConf.remoteRoot,
					exclude: []
				};

			mocks.fs.readFile.withArgs(authConfigFilePath).yields(null, validAuthConf);
			mocks.fs.readFile.withArgs(ftpConfigFilePath).yields(null, validFtpConf);
			mocks.fs.stat.withArgs(localRootPath).yields(null, {isDirectory: sinon.stub().returns(true)});

			expect(config.create()).to.eventually.deep.equal(conf).notify(done);
		});

		it('should consume custom port', function (done) {
			var parsedFtpConf = JSON.parse(validFtpConf),
				modifiedFtpConf = JSON.stringify(Object.assign(parsedFtpConf, {port: 69}));

			mocks.fs.readFile.withArgs(authConfigFilePath).yields(null, validAuthConf);
			mocks.fs.readFile.withArgs(ftpConfigFilePath).yields(null, modifiedFtpConf);
			mocks.fs.stat.withArgs(localRootPath).yields(null, {isDirectory: sinon.stub().returns(true)});

			expect(config.create()).to.eventually.have.property('port', 69).notify(done);
		});
	});

	after(function () {
		mockery.deregisterMock('fs');
		mockery.disable('fs');
	});
});