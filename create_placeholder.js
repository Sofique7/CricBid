// Placeholder premium avatar (transparent circle with gold border)
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const size = 400;
const avatarSize = size - 40;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Transparent background
ctx.clearRect(0,0,size,size);

// Draw gold border circle
ctx.beginPath();
ctx.arc(size/2, size/2, avatarSize/2, 0, Math.PI*2);
ctx.lineWidth = 6;
ctx.strokeStyle = '#D4AF37';
ctx.stroke();

// Optional subtle shadow
ctx.shadowColor = 'rgba(0,0,0,0.4)';
ctx.shadowBlur = 10;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;

// Save PNG
const outPath = path.join(__dirname, 'public','assets','player-avatars','placeholder.png');
fs.mkdirSync(path.dirname(outPath), {recursive:true});
fs.writeFileSync(outPath, canvas.toBuffer());
console.log('Placeholder created at', outPath);
