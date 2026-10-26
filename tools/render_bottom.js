const { execSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
const outPng = path.resolve(__dirname, '../site_render_bottom_section.png');

console.log('Rendering 1440x9500...');
try {
  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outPng}" --window-size=1440,9500 --virtual-time-budget=2000 "${htmlPath}"`, { stdio: 'inherit' });
  console.log('Captured bottom section:', outPng);
} catch (err) {
  console.error('Error:', err);
}
