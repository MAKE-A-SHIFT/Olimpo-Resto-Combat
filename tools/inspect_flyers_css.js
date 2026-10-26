const fs = require('fs');
const css = fs.readFileSync('styles.css', 'utf8');

const lines = css.split('\n');
lines.forEach((l, i) => {
  if (l.includes('.flyers-grid') || l.includes('.flyer-card') || l.includes('.flyer-img') || l.includes('lightboxModal')) {
    console.log(i + 1, l);
  }
});
