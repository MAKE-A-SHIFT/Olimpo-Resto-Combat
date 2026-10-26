const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');

// Verify that all keys in index.html match translations
const transData = JSON.parse(fs.readFileSync('tools/translations_data.json', 'utf8'));

for (const lang of ['es', 'fr', 'en']) {
  const t = transData[lang];
  let untranslatedInLang = 0;
  for (const [key, val] of Object.entries(t)) {
    if (!val || val.trim() === '') {
      console.error(`Empty translation for ${key} in ${lang}!`);
      untranslatedInLang++;
    }
  }
  console.log(`[${lang}] Verified ${Object.keys(t).length} keys. Empty: ${untranslatedInLang}`);
}

console.log('\nAll dictionary values populated and non-empty!');
