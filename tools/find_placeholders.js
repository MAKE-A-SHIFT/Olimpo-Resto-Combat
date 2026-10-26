const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('placeholder=')) {
    console.log(`L${idx + 1}: ${l.trim()}`);
  }
});
