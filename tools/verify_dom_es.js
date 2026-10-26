const fs = require('fs');
const dom = fs.readFileSync('tools/dumped_dom_es.html', 'utf8');

const keyMatches = [...dom.matchAll(/data-i18n="([^"]+)"[^>]*>([^<]+)/g)];
console.log('Total matched rendered elements:', keyMatches.length);

const transData = JSON.parse(fs.readFileSync('tools/translations_data.json', 'utf8'));

let matchCount = 0;
let mismatchCount = 0;

for (const m of keyMatches) {
  const key = m[1];
  const renderedText = m[2].trim();
  const expectedText = (transData.es[key] || '').replace(/<[^>]+>/g, '').trim();

  // If expected has special tags or is exact
  if (renderedText === expectedText || expectedText.includes(renderedText) || renderedText.includes(expectedText)) {
    matchCount++;
  } else {
    mismatchCount++;
    if (mismatchCount <= 10) {
      console.log(`Mismatch key "${key}": Rendered "${renderedText.slice(0, 40)}" vs Expected "${expectedText.slice(0, 40)}"`);
    }
  }
}

console.log(`Matched: ${matchCount}, Mismatches: ${mismatchCount}`);
