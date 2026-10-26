const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
const outPng = path.resolve(__dirname, '../site_render_affiliate_footer.png');

console.log('Rendering affiliate section...');
try {
  // We can open index.html#afiliados to scroll directly there
  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outPng}" --window-size=1440,3200 --virtual-time-budget=2000 "${htmlPath}#afiliados"`, { stdio: 'inherit' });
  console.log('Affiliate section rendered successfully to:', outPng);
} catch (err) {
  console.error('Render error:', err);
}
