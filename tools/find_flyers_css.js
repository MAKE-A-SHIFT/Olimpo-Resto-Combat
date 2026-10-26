const fs = require('fs');
const css = fs.readFileSync('styles.css', 'utf8');
const lines = css.split('\n');
lines.forEach((l, i) => {
  if (l.includes('flyer')) {
    console.log(`${i}: ${l}`);
  }
});
