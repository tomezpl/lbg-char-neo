const { readFileSync } = require('fs');
const path = require('path');

const version = readFileSync(path.resolve(__dirname, '..', 'next-version'), { encoding: 'utf-8' });

console.log(`chore(release): ${version}`);