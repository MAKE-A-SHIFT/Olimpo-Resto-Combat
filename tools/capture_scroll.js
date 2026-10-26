const { execSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\firet\\Documents\\Business - Wealth - VALUE CREATION\\OLIMPO Resto\\Antigravity project - Olimpo';
const targetDir = 'C:\\Users\\firet\\.gemini\\antigravity\\brain\\2b13232b-dfee-4314-8871-f08523636881';

const modalFull = path.join(targetDir, 'screenshot_checkout_full.png');
const pricingFull = path.join(targetDir, 'screenshot_pricing_full.png');
const flyersFull = path.join(targetDir, 'screenshot_flyers_full.png');

console.log('1. Capturing full checkout modal with summary...');
execSync(`"${chromePath}" --headless=new --disable-gpu --window-size=1280,1800 --virtual-time-budget=2000 --screenshot="${modalFull}" "http://localhost:3000/?checkout=pack_fighter_pro_semanal"`);

console.log('Finished full captures.');
