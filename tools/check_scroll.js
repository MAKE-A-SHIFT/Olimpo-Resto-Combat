const fs = require('fs');
const js = fs.readFileSync('app.js', 'utf8');
console.log('Includes scroll_to?', js.includes('scroll_to'));
