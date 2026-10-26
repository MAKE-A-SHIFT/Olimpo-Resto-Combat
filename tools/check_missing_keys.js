const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const keyRegex = /data-i18n="([^"]+)"/g;
const placeholderRegex = /data-i18n-placeholder="([^"]+)"/g;

const htmlKeys = new Set();
let m;
while ((m = keyRegex.exec(html)) !== null) {
  htmlKeys.add(m[1]);
}
while ((m = placeholderRegex.exec(html)) !== null) {
  htmlKeys.add(m[1]);
}

console.log('Total HTML keys required:', htmlKeys.size);

// Load translations from app.js
const appJs = fs.readFileSync('app.js', 'utf8');
const transBlockMatch = appJs.match(/const translations = (\{[\s\S]*?\n  \};\n\n  const checkoutTranslations)/);
if (!transBlockMatch) {
  console.error('Could not extract translations block!');
  process.exit(1);
}

// Evaluate translations object safely in isolated vm
const vm = require('vm');
const context = {};
vm.runInNewContext('translations = ' + transBlockMatch[1].replace(/;\s*const checkoutTranslations$/, ''), context);
const t = context.translations;

for (const lang of ['es', 'fr', 'en']) {
  if (!t[lang]) {
    console.error(`Language ${lang} missing completely!`);
    continue;
  }
  const missing = [];
  for (const k of htmlKeys) {
    if (t[lang][k] === undefined) {
      missing.push(k);
    }
  }
  console.log(`[${lang}] Missing keys count: ${missing.length}`);
  if (missing.length > 0) {
    console.log(`[${lang}] First 20 missing:`, missing.slice(0, 20));
  }
}
