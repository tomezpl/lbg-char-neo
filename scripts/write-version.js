const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

const version = process.argv[2];

if (typeof version !== 'string' || !version.match(/(\d+\.){2}\d+(-(hotfix|alpha|rc)\.\d+)?/)) {
    throw new Error(`[write-version] version is invalid semver - received ${version}`);
}

const packageJson = JSON.parse(readFileSync(path.resolve(__dirname, '..', 'package.json'), { encoding: 'utf-8' }));
packageJson.version = version;
writeFileSync(path.resolve(__dirname, '..', 'package.json'), JSON.stringify(packageJson, undefined, 2));

const fxmanifest = readFileSync(path.resolve(__dirname, '..', 'fxmanifest.lua'), { encoding: 'utf-8' });
const manifestLines = fxmanifest.split('\n');
const versionLine = manifestLines.findIndex((line) => line.startsWith('version '));
if (versionLine !== -1) {
    manifestLines[versionLine] = `version '${version}'`;
}

writeFileSync(path.resolve(__dirname, '..', 'fxmanifest.lua'), manifestLines.join('\n'), { encoding: 'utf-8' });