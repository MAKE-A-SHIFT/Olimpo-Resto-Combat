const { execSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetDir = 'C:\\Users\\firet\\.gemini\\antigravity\\brain\\2b13232b-dfee-4314-8871-f08523636881';

const desktopFlyers = path.join(targetDir, 'screenshot_website_flyers_desktop.png');
const mobileFlyers = path.join(targetDir, 'screenshot_website_flyers_mobile.png');

console.log('Capturing Desktop Flyers Section with scroll_to=flyers...');
execSync(`"${chromePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --window-size=1280,1200 --screenshot="${desktopFlyers}" "http://localhost:3000/?scroll_to=flyers"`, { stdio: 'inherit' });

console.log('Capturing Mobile Flyers Section with scroll_to=flyers...');
execSync(`"${chromePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --window-size=390,1200 --screenshot="${mobileFlyers}" "http://localhost:3000/?scroll_to=flyers"`, { stdio: 'inherit' });

console.log('Done capturing website flyers views!');
