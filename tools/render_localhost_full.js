const { execSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outPng = path.resolve(__dirname, '../localhost_full_rendered.png');

console.log('Rendering 1440x10200 full page...');
try {
  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outPng}" --window-size=1440,10200 --virtual-time-budget=2000 "http://localhost:3000/"`, { stdio: 'inherit' });
  console.log('Saved to:', outPng);
} catch (e) {
  console.error(e);
}
