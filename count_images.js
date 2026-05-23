const fs = require('fs');
const d = fs.readFileSync('src/data/players.ts', 'utf8');
const m = [...d.matchAll(/"image":\s*"([^"]*)"/g)];
const filled = m.filter(x => x[1].length > 0);
const empty = m.filter(x => x[1].length === 0);
console.log('Total:', m.length, 'With image:', filled.length, 'Empty:', empty.length);

// Show a few filled examples
console.log('\nSample filled:');
filled.slice(0, 5).forEach(x => console.log(' ', x[1]));

// Show names of players without images
const nameRegex = /"name":\s*"([^"]+)",[\s\S]*?"image":\s*""/g;
let match;
const emptyNames = [];
while ((match = nameRegex.exec(d)) !== null) {
  emptyNames.push(match[1]);
}
console.log('\nPlayers with empty image (' + emptyNames.length + '):');
emptyNames.forEach(n => console.log(' ', n));
