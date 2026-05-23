const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'src', 'data', 'players.ts');
let tsData = fs.readFileSync(tsPath, 'utf8');

const missing = [];
const allPlayers = [];

// Match all player objects. Quick regex:
let match;
const regex = /\{\s*"id":\s*"[^"]+",\s*"name":\s*"([^"]+)",[\s\S]*?"image":\s*"([^"]*)"/g;

while ((match = regex.exec(tsData)) !== null) {
    allPlayers.push(match[1]);
    if (!match[2] || match[2].trim() === '') {
        missing.push(match[1]);
    }
}

console.log(`Total players parsed: ${allPlayers.length}`);
console.log(`Total missing: ${missing.length}`);
fs.writeFileSync('missing_players.json', JSON.stringify(missing, null, 2));
