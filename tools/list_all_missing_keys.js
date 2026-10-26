const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const keyRegex = /data-i18n="([^"]+)"/g;
const placeholderRegex = /data-i18n-placeholder="([^"]+)"/g;

const htmlKeys = new Set();
let m;
while ((m = keyRegex.exec(html)) !== null) htmlKeys.add(m[1]);
while ((m = placeholderRegex.exec(html)) !== null) htmlKeys.add(m[1]);

const appJs = fs.readFileSync('app.js', 'utf8');
const transBlockMatch = appJs.match(/const translations = (\{[\s\S]*?\n  \};\n\n  const checkoutTranslations)/);
const vm = require('vm');
const context = {};
vm.runInNewContext('translations = ' + transBlockMatch[1].replace(/;\s*const checkoutTranslations$/, ''), context);
const t = context.translations;

const missing = [];
for (const k of htmlKeys) {
  if (t.es[k] === undefined) {
    missing.push(k);
  }
}
console.log('List of all missing keys (' + missing.length + '):');
console.log(JSON.stringify(missing, null, 2));
