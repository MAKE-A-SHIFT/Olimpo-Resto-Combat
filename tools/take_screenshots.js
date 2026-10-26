const { execSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\firet\\.gemini\\antigravity\\brain\\2b13232b-dfee-4314-8871-f08523636881';

const s1 = path.join(artifactDir, 'screenshot_checkout_weekly.png');
const s2 = path.join(artifactDir, 'screenshot_pricing_table.png');
const s3 = path.join(artifactDir, 'screenshot_flyers_hub.png');

console.log('Capturing checkout modal with weekly pack...');
execSync(`"${chromePath}" --headless=new --disable-gpu --window-size=1280,1050 --virtual-time-budget=2000 --screenshot="${s1}" "http://localhost:3000/?checkout=pack_fighter_pro_semanal"`);

console.log('Capturing pricing table...');
execSync(`"${chromePath}" --headless=new --disable-gpu --window-size=1280,1100 --virtual-time-budget=2000 --screenshot="${s2}" "http://localhost:3000/#tarifas"`);

console.log('Capturing flyers section...');
execSync(`"${chromePath}" --headless=new --disable-gpu --window-size=1280,1050 --virtual-time-budget=2000 --screenshot="${s3}" "http://localhost:3000/#flyers"`);

console.log('Finished capturing screenshots directly in artifact dir.');
