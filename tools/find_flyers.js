const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('flyers')) {
    console.log(`${i}: ${l}`);
  }
});
