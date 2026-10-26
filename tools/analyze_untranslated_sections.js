const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// List all sections
const sections = [...html.matchAll(/<section[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
console.log('Sections found:', sections.map(s => s[1]));

sections.forEach(s => {
  const sId = s[1];
  const sContent = s[2];
  const missingI18n = [];
  const textMatches = [...sContent.matchAll(/>([^<]+)</g)];
  textMatches.forEach(m => {
    const text = m[1].trim();
    if (text && text.length > 2 && !text.startsWith('&') && !text.startsWith('//') && !text.includes('{') && !text.includes('}')) {
      const pre = sContent.substring(Math.max(0, m.index - 200), m.index + 1);
      if (!pre.includes('data-i18n=')) {
        missingI18n.push(text);
      }
    }
  });
  console.log(`\n=== Section #${sId} === (Missing i18n count: ${missingI18n.length})`);
  missingI18n.slice(0, 10).forEach(t => console.log(' - ' + t));
});
