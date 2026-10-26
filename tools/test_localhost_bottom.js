const { execSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outPng = path.resolve(__dirname, '../localhost_pricing_contact.png');

console.log('Taking screenshot of pricing & contact on localhost...');
try {
  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outPng}" --window-size=1440,7500 --virtual-time-budget=2000 "http://localhost:3000/#tarifas"`, { stdio: 'inherit' });
  console.log('Saved to:', outPng);
} catch (e) {
  console.error(e);
}
