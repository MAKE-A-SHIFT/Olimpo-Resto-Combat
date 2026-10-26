const { execSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDesktop = path.resolve(__dirname, '../redesign_desktop_preview.png');
const outMobile = path.resolve(__dirname, '../redesign_mobile_preview.png');

console.log('Rendering redesigned site from http://localhost:3000 ...');
try {
  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outDesktop}" --window-size=1440,3400 --virtual-time-budget=2500 "http://localhost:3000/"`, { stdio: 'inherit' });
  console.log('Desktop captured:', outDesktop);

  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outMobile}" --window-size=412,3400 --virtual-time-budget=2500 "http://localhost:3000/"`, { stdio: 'inherit' });
  console.log('Mobile captured:', outMobile);
} catch (e) {
  console.error('Error:', e);
}
