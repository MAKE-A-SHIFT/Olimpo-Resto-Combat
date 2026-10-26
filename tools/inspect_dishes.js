const fs = require('fs');
const js = fs.readFileSync('app.js', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');

// Check renderDishes in app.js
const m = js.match(/function renderDishes[\s\S]*?function/);
if (m) console.log(m[0].substring(0, 1200));

// Check dish-card in styles.css
const cssLines = css.split('\n');
cssLines.forEach((l, i) => {
  if (l.includes('.dish-card') || l.includes('.weekly-dishes-grid') || l.includes('.dish-img') || l.includes('.dish-preview')) {
    console.log(i + 1, l);
  }
});
