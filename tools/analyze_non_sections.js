const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Find modals, header, footer
const nonSectionMatches = [
  { name: 'Announcement Bar', html: html.match(/<div class="announcement-bar"[\s\S]*?<\/div>\s*<\/div>/)?.[0] },
  { name: 'Navbar', html: html.match(/<header class="navbar"[\s\S]*?<\/header>/)?.[0] },
  { name: 'Checkout Modal', html: html.match(/<div id="checkoutModal"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)?.[0] },
  { name: 'Legal Modal', html: html.match(/<div id="legalModal"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)?.[0] },
  { name: 'Footer', html: html.match(/<footer[\s\S]*?<\/footer>/)?.[0] }
];

nonSectionMatches.forEach(item => {
  if (!item.html) {
    console.log(`=== ${item.name} not found by regex ===`);
    return;
  }
  const missing = [];
  const textMatches = [...item.html.matchAll(/>([^<]+)</g)];
  textMatches.forEach(m => {
    const text = m[1].trim();
    if (text && text.length > 2 && !text.startsWith('&') && !text.startsWith('//') && !text.includes('{') && !text.includes('}')) {
      const pre = item.html.substring(Math.max(0, m.index - 200), m.index + 1);
      if (!pre.includes('data-i18n=')) {
        missing.push(text);
      }
    }
  });
  console.log(`=== ${item.name} === (Missing count: ${missing.length})`);
  missing.slice(0, 8).forEach(t => console.log(' - ' + t));
});
