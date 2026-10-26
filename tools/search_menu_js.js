const fs = require('fs');
const js = fs.readFileSync('app.js', 'utf8');

const lines = js.split('\n');
lines.forEach((l, i) => {
  if (l.includes('btn-menu-tab') || l.includes('filter') || l.includes('weekly-dishes') || l.includes('renderDishes') || l.includes('openImageModal') || l.includes('lightbox')) {
    console.log(i + 1, l);
  }
});
