const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Use regex or simple parser to find elements with visible text without data-i18n
// Let's check all tags with innerText that doesn't have data-i18n
const lines = html.split('\n');
let inScript = false;
let inStyle = false;
const untranslated = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('<script')) inScript = true;
  if (line.includes('</script>')) { inScript = false; continue; }
  if (line.includes('<style')) inStyle = true;
  if (line.includes('</style>')) { inStyle = false; continue; }
  if (inScript || inStyle) continue;

  // Match tags with text content
  const matches = line.matchAll(/<([a-zA-Z0-9]+)([^>]*)>([^<]+)<\/\1>/g);
  for (const m of matches) {
    const tag = m[1].toLowerCase();
    const attrs = m[2];
    const text = m[3].trim();

    if (['script', 'style', 'svg', 'path'].includes(tag)) continue;
    if (!text) continue;
    // skip purely numbers or symbols
    if (/^[\d\s.,%+–—\/:₲$€()•*x\-!#]+$/.test(text)) continue;

    const hasI18n = attrs.includes('data-i18n') || attrs.includes('id="bannerRefCode"') || attrs.includes('class="dish-') || attrs.includes('class="flyer-');
    if (!hasI18n) {
      untranslated.push({ lineNum: i + 1, tag, text, line: line.trim() });
    }
  }
}

console.log('Potentially untranslated elements:', untranslated.length);
untranslated.forEach(u => console.log(`L${u.lineNum} <${u.tag}>: "${u.text}"`));
