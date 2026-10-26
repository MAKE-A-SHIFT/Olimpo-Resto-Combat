const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('app.js', 'utf8');

// Find all data-i18n attributes in html
const dataI18nMatches = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
console.log('Total data-i18n tags in HTML:', dataI18nMatches.length);
const uniqueHtmlKeys = [...new Set(dataI18nMatches)];
console.log('Unique data-i18n keys in HTML:', uniqueHtmlKeys.length);

// Extract translations object from app.js using VM or regex
const transStart = js.indexOf('const translations = {');
const transEnd = js.indexOf('// --- DOM TRANSLATION FUNCTION ---');
const transCode = js.substring(transStart, transEnd);

let translations;
try {
  eval(transCode + '; global.translations = translations;');
  translations = global.translations;
  console.log('ES keys in translations:', Object.keys(translations.es).length);
  console.log('FR keys in translations:', Object.keys(translations.fr).length);
  console.log('EN keys in translations:', Object.keys(translations.en).length);
} catch (e) {
  console.error('Error evaluating translations:', e.message);
}

if (translations) {
  // Check if all unique HTML keys exist in translations
  const missingInEs = uniqueHtmlKeys.filter(k => !(k in translations.es));
  const missingInFr = uniqueHtmlKeys.filter(k => !(k in translations.fr));
  const missingInEn = uniqueHtmlKeys.filter(k => !(k in translations.en));
  console.log('Keys in HTML but missing in ES:', missingInEs);
  console.log('Keys in HTML but missing in FR:', missingInFr);
  console.log('Keys in HTML but missing in EN:', missingInEn);
}
