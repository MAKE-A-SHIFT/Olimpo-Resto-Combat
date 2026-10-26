const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Parse HTML or find text nodes between tags
const tagRegex = />([^<]+)</g;
let match;
const texts = [];
while ((match = tagRegex.exec(html)) !== null) {
  const text = match[1].trim();
  if (text && text.length > 2 && !text.startsWith('&') && !text.startsWith('//') && !text.includes('{') && !text.includes('}')) {
    // Find preceding tag
    const pre = html.substring(Math.max(0, match.index - 200), match.index + 1);
    const hasI18n = pre.includes('data-i18n=');
    texts.push({ text, hasI18n, snippet: pre.substring(pre.lastIndexOf('<')) });
  }
}

const untranslated = texts.filter(t => !t.hasI18n);
console.log(`Total text snippets found: ${texts.length}`);
console.log(`Untranslated snippets (no data-i18n on tag): ${untranslated.length}`);

// Print untranslated grouped or sample
untranslated.slice(0, 50).forEach(u => {
  console.log(`[NO I18N] ${u.snippet} -> "${u.text}"`);
});
