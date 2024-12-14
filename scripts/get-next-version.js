const { spawnSync } = require("child_process");
const { readFileSync } = require('fs');
const path = require("path");

const branch = process.argv[2];
const tagType = process.argv[3];

if (tagType === 'hotfix' || tagType === 'release') {
    console.log(branch.slice(1));
}
else if (tagType === 'rc' || tagType === 'alpha') {
    let version = branch.slice(1);
    if (tagType === 'alpha') {
        const { version: packageVersion } = JSON.parse(readFileSync(path.resolve(__dirname, '..', 'package.json'), { encoding: 'utf-8' }));
        version = packageVersion;

    }
    spawnSync('git fetch --all --tags');
    const lastTag = spawnSync(`git tag -l ${version}-${tagType}.*`, { encoding: 'utf8' })?.stdout?.split('\n')?.at(-1);
    const lastBuildNum = lastTag?.slice?.(lastTag.lastIndexOf('.') + 1) || 0;
    const newBuildNum = Number(lastBuildNum) + 1;

    console.log(`${version}-${tagType}.${newBuildNum}`);
}