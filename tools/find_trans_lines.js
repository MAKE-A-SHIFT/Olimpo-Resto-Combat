const fs = require('fs');
const lines = fs.readFileSync('app.js', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('const translations =') || l.includes('function applyTranslations') || l.includes('setLanguage')) {
    console.log(`${i}: ${l}`);
  }
});
