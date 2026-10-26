const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');

const keyRegex = /data-i18n="([^"]+)"/g;
const placeholderRegex = /data-i18n-placeholder="([^"]+)"/g;

const htmlKeys = new Set();
let m;
while ((m = keyRegex.exec(html)) !== null) htmlKeys.add(m[1]);
const placeholderKeys = new Set();
while ((m = placeholderRegex.exec(html)) !== null) placeholderKeys.add(m[1]);

console.log('Total data-i18n keys:', htmlKeys.size);
console.log('Total data-i18n-placeholder keys:', placeholderKeys.size);

const startIdx = app.indexOf('const translations =');
const midIdx = app.indexOf('const checkoutTranslations =');
const endIdx = app.indexOf('function updateCheckoutSelectorTranslations');

const transCode = app.substring(startIdx, midIdx).replace('const translations =', 'var translations =');
const checkoutCode = app.substring(midIdx, endIdx).replace('const checkoutTranslations =', 'var checkoutTranslations =');

const sandbox = {};
vm.runInNewContext(transCode + '\n' + checkoutCode, sandbox);
const t = sandbox.translations;
const ct = sandbox.checkoutTranslations;

let allPass = true;

for (const lang of ['es', 'fr', 'en']) {
  console.log(`\n--- TESTING LANGUAGE: ${lang.toUpperCase()} ---`);
  if (!t[lang]) {
    console.error(`Missing language ${lang} in translations!`);
    allPass = false;
    continue;
  }

  // 1. Check all data-i18n
  const missingI18n = [];
  for (const k of htmlKeys) {
    if (t[lang][k] === undefined || t[lang][k] === null || t[lang][k] === '') {
      missingI18n.push(k);
    }
  }
  console.log(`[${lang}] Missing data-i18n keys: ${missingI18n.length}`);
  if (missingI18n.length > 0) {
    console.error(`[${lang}] Missing keys:`, missingI18n);
    allPass = false;
  }

  // 2. Check all data-i18n-placeholder
  const missingPlaceholders = [];
  for (const k of placeholderKeys) {
    if (t[lang][k] === undefined || t[lang][k] === null || t[lang][k] === '') {
      missingPlaceholders.push(k);
    }
  }
  console.log(`[${lang}] Missing placeholder keys: ${missingPlaceholders.length}`);
  if (missingPlaceholders.length > 0) {
    console.error(`[${lang}] Missing placeholders:`, missingPlaceholders);
    allPass = false;
  }

  // 3. Check checkoutTranslations
  if (!ct[lang]) {
    console.error(`Missing ${lang} in checkoutTranslations!`);
    allPass = false;
  } else {
    const clubChoices = Object.keys(ct[lang].clubChoices || {});
    const optgroups = Object.keys(ct[lang].optgroups || {});
    const plans = Object.keys(ct[lang].plans || {});
    const singleDishes = Object.keys(ct[lang].singleDishes || {});
    console.log(`[${lang}] checkoutTranslations items:`, {
      clubChoices: clubChoices.length,
      optgroups: optgroups.length,
      plans: plans.length,
      singleDishes: singleDishes.length
    });
    if (clubChoices.length < 4 || optgroups.length < 4 || plans.length < 8 || singleDishes.length < 10) {
      console.error(`[${lang}] Incomplete checkoutTranslations!`);
      allPass = false;
    }
  }
}

if (allPass) {
  console.log('\n🌟 ALL 3 LANGUAGES (ES, FR, EN) VERIFIED AND 100% COMPLETE IN APP.JS! 🌟');
} else {
  process.exit(1);
}
