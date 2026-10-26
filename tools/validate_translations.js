const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const keyRegex = /data-i18n="([^"]+)"/g;
const placeholderRegex = /data-i18n-placeholder="([^"]+)"/g;

const htmlKeys = new Set();
let m;
while ((m = keyRegex.exec(html)) !== null) htmlKeys.add(m[1]);
while ((m = placeholderRegex.exec(html)) !== null) htmlKeys.add(m[1]);

console.log('Total HTML keys required:', htmlKeys.size);

const transData = JSON.parse(fs.readFileSync('tools/translations_data.json', 'utf8'));

let hasError = false;
for (const lang of ['es', 'fr', 'en']) {
  const missing = [];
  for (const k of htmlKeys) {
    if (transData[lang][k] === undefined) {
      missing.push(k);
    }
  }
  console.log(`[${lang}] Keys in dict: ${Object.keys(transData[lang]).length}, Missing keys: ${missing.length}`);
  if (missing.length > 0) {
    console.log(`[${lang}] Missing list:`, missing);
    hasError = true;
  }
}

if (!hasError) {
  console.log('✅ ALL HTML KEYS ARE 100% COVERED ACROSS ES, FR, AND EN!');
} else {
  process.exit(1);
}
