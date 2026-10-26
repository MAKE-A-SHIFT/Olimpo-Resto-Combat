const { execSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outBottom = path.resolve(__dirname, '../redesign_bottom_preview.png');

console.log('Rendering lower half of redesigned site...');
try {
  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outBottom}" --window-size=1440,6800 --virtual-time-budget=2000 "http://localhost:3000/#tarifas"`, { stdio: 'inherit' });
  console.log('Saved to:', outBottom);
} catch (e) {
  console.error(e);
}
