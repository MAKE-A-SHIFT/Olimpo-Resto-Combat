const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
const outPng = path.resolve(__dirname, '../site_render_full.png');

console.log('Rendering full height desktop site...');
try {
  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outPng}" --window-size=1440,7200 --virtual-time-budget=2500 "${htmlPath}"`, { stdio: 'inherit' });
  console.log('Full desktop rendered successfully to:', outPng);
} catch (err) {
  console.error('Render error:', err);
}
