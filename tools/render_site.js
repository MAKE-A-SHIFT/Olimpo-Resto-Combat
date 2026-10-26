const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
const outPng = path.resolve(__dirname, '../site_render_desktop.png');

console.log('Rendering site desktop from:', htmlPath);
try {
  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outPng}" --window-size=1440,3200 --virtual-time-budget=2000 "${htmlPath}"`, { stdio: 'inherit' });
  console.log('Desktop rendered successfully to:', outPng);
  const stats = fs.statSync(outPng);
  console.log('File size:', stats.size, 'bytes');
} catch (err) {
  console.error('Render error:', err);
}
