const fs = require('fs');
const lines = fs.readFileSync('app.js', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.toLowerCase().includes('flyer')) {
    console.log(`${i}: ${l}`);
  }
});
