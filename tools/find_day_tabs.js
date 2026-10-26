const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('app.js', 'utf8');

console.log('Day tabs in html:');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('day-tab') || l.includes('lunes') || l.includes('Lundi')) {
    console.log(i + 1, l.trim());
  }
});

console.log('\nDay tabs in JS:');
const jsLines = js.split('\n');
jsLines.forEach((l, i) => {
  if (l.includes('day-tab') || l.includes('lunes') || l.includes('Lunes')) {
    console.log(i + 1, l.trim());
  }
});
