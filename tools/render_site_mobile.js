const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
const outPng = path.resolve(__dirname, '../site_render_mobile.png');

console.log('Rendering site mobile from:', htmlPath);
try {
  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outPng}" --window-size=412,3600 --virtual-time-budget=2000 "${htmlPath}"`, { stdio: 'inherit' });
  console.log('Mobile rendered successfully to:', outPng);
  const stats = fs.statSync(outPng);
  console.log('File size:', stats.size, 'bytes');
} catch (err) {
  console.error('Render error:', err);
}
