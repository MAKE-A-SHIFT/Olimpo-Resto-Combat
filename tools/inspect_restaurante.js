const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const start = html.indexOf('id="restaurante"');
const end = html.indexOf('id="flyers"');
const restoSection = html.substring(start, end);

// Find headings or sub-sections in restaurante
const subheadings = [...restoSection.matchAll(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/g)];
subheadings.forEach(h => console.log('Heading:', h[1].replace(/<[^>]+>/g, '').trim()));

// Also check day tabs / week dishes in restaurante
console.log('\n--- DAY TABS / WEEK DISHES ---');
const dayTabsMatch = restoSection.match(/<div class="day-tabs"[\s\S]*?<\/div>/);
if (dayTabsMatch) console.log(dayTabsMatch[0]);

const dishesGrid = restoSection.match(/<div class="dishes-grid" id="dishesGrid"[\s\S]*?<\/div>/);
if (dishesGrid) console.log('dishesGrid found');
