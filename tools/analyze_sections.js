const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Check sections
const secMatches = [...html.matchAll(/<section id="([^"]+)"[^>]*>/g)];
secMatches.forEach(m => console.log('Found section:', m[1]));

// Check restaurant section contents
const restoMatch = html.match(/id="restaurante"[\s\S]*?id="flyers"/);
if (restoMatch) {
  console.log('\n--- RESTAURANTE HEAD ---');
  console.log(restoMatch[0].substring(0, 500));
}

// Check flyers section
const flyersMatch = html.match(/id="flyers"[\s\S]*?id="tarifas"/);
if (flyersMatch) {
  console.log('\n--- FLYERS SECTION ---');
  console.log(flyersMatch[0].substring(0, 1000));
}
