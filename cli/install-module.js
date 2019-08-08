#!/usr/bin/env node
var path = require('path');
var args = process.argv.slice(2);

// console.error('process.env: ' + JSON.stringify(process.env, null, 2));

if (!args.length && !process.env.npm_package_name) {
	console.error('No parameters specified and not run from npm package script');
	process.exit(1);
}

var tiappDir = require('../lib/tiapp-dir');
var root = tiappDir.sync(__dirname);

if (!root) {
	console.error('Could not find tiapp.xml in directory tree: ' + __dirname);
	process.exit(1);
}

var tiapp = require('../lib/tiapp-xml').load(path.join(root, 'tiapp.xml'));
console.log('found tiapp.xml:  ' + tiapp);

if (!args.length && process.env.npm_package_name) {
	var platforms = getPlatforms();

	platforms.forEach(platform => {
		removeModule(process.env.npm_package_name, platform);
		addModule(process.env.npm_package_name, platform, process.env.npm_package_version);
	});
	tiapp.write();

} else if (args.length) {
	removeModule(args[0], args[1]);
	addModule(args[0], args[1], args[2]);
	tiapp.write();
}

function addModule(name, platform, version) {

	console.error('installing module: ' + JSON.stringify(arguments, null, 2));
	if (platform && version) {
		tiapp.setModule(name, { platform: platform, version: version  });
	} else if (!platform) {
		tiapp.setModule(name, { version: version  });
	} else if (!version) {
		tiapp.setModule(name, { platform: platform });
	}
}

function removeModule(name, platform) {
	if (platform) {
		tiapp.removeModule(name, platform);
	} else {
		tiapp.removeModule(name);
	}
}

function getPlatforms() {

	var platforms = [];

	process.env.npm_package_titanium_platform_0 && platforms.push(process.env.npm_package_titanium_platform_0);
	process.env.npm_package_titanium_platform_1 && platforms.push(process.env.npm_package_titanium_platform_1);
	process.env.npm_package_titanium_platform_2 && platforms.push(process.env.npm_package_titanium_platform_2);

	if (!platforms.length) {
		console.error('titanium.platform not defined in package.json for package: ' + process.env.npm_package_name);
		process.exit(1);
	}

	return platforms;
}
