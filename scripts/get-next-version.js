const { spawnSync, execSync } = require("child_process");
const { readFileSync } = require('fs');
const path = require("path");

const branch = process.argv[2];

let tagType = 'alpha';

if (branch.match(/^v\d+\.\d+\.\d+$/)) {
    tagType = 'rc';
} else if (branch.match(/^v\d+\.\d+\.\d+-hotfix\d+$/)) {
    tagType = 'hotfix';
} else if (branch.match(/^main$/)) {
    tagType = 'release';
} else if (branch.match(/^develop$/)) {
    tagType = 'alpha';
}

if (tagType === 'release') {
    const { version: packageVersion } = JSON.parse(readFileSync(path.resolve(__dirname, '..', 'package.json'), { encoding: 'utf-8' }));
    console.log(packageVersion);
}
else if(tagType === 'hotfix') {
    console.log(branch.slice(1));
}
else if (tagType === 'rc' || tagType === 'alpha') {
    let version = branch.slice(1);
    if (tagType === 'alpha') {
        const { version: packageVersion } = JSON.parse(readFileSync(path.resolve(__dirname, '..', 'package.json'), { encoding: 'utf-8' }));
        version = packageVersion;

    }
    const lastTag = execSync(`git tag -l ${version}-${tagType}.*`, { encoding: 'utf8' })
        ?.split('\n')
        ?.filter((line) => !!line)
        ?.sort((a, b) => Math.min(1, Math.max(-1, Number(a.slice(a.lastIndexOf('.') + 1) - Number(b.slice(b.lastIndexOf('.') + 1))))))
        ?.at(-1);
    const lastBuildNum = lastTag?.slice?.(lastTag.lastIndexOf('.') + 1) || 0;
    const newBuildNum = Number(lastBuildNum) + 1;

    console.log(`${version}-${tagType}.${newBuildNum}`);
}
