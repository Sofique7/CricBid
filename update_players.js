const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, 'premium_player_map.json');
let mapData = {};
try {
  mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
} catch (e) {
  console.log("No map found");
  process.exit(1);
}

const tsPath = path.join(__dirname, 'src', 'data', 'players.ts');
let tsData = fs.readFileSync(tsPath, 'utf8');

// We want to replace the empty image string with the mapped one
let newTsData = tsData.replace(/(\{\s*"id":\s*"[^"]+",\s*"name":\s*"([^"]+)",[\s\S]*?"image":\s*")([^"]*)(")/g, (match, p1, name, p3, p4) => {
    const key = name.toLowerCase().trim();
    let mappedImage = p3;
    
    // Exact match
    if (mapData[key]) {
        mappedImage = mapData[key];
    } else {
        // Partial match
        for (const [mapName, mapImage] of Object.entries(mapData)) {
            // example: mapName might be "david warner", key might be "david warner "
            if (mapName === key || key.includes(mapName) || mapName.includes(key)) {
                mappedImage = mapImage;
                break;
            }
        }
    }
    
    return p1 + mappedImage + p4;
});

fs.writeFileSync(tsPath, newTsData, 'utf8');
console.log('Updated players.ts');
