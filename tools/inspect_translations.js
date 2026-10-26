const fs = require('fs');
const js = fs.readFileSync('app.js', 'utf8');

const m = js.match(/const translations = \{[\s\S]*?\n  \};\n\n  function applyLanguage/);
if (m) {
  eval(m[0].replace('function applyLanguage', ''));
  console.log('ES keys count:', Object.keys(translations.es).length);
  console.log('FR keys count:', Object.keys(translations.fr).length);
  console.log('Sample keys:', Object.keys(translations.es).slice(0, 15));
} else {
  console.log('translations regex did not match');
}
