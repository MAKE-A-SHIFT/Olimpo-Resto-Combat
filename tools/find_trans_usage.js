const fs = require('fs');
const lines = fs.readFileSync('app.js', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('translations')) {
    console.log(`${i}: ${l}`);
  }
});
