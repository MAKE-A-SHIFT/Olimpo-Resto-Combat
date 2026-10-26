const { execSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetDir = 'C:\\Users\\firet\\.gemini\\antigravity\\brain\\2b13232b-dfee-4314-8871-f08523636881';

const pricingShot = path.join(targetDir, 'screenshot_pricing_view.png');
const flyersShot = path.join(targetDir, 'screenshot_flyers_view2.png');

console.log('Capturing pricing view...');
execSync(`"${chromePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --window-size=1280,1200 --screenshot="${pricingShot}" "http://localhost:3000/?scroll_to=tarifas"`);

console.log('Capturing flyers view...');
execSync(`"${chromePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --window-size=1280,1200 --screenshot="${flyersShot}" "http://localhost:3000/?scroll_to=flyers"`);

console.log('Done captures.');
