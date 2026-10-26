const { execSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetDir = 'C:\\Users\\firet\\.gemini\\antigravity\\brain\\2b13232b-dfee-4314-8871-f08523636881';

const flyersShot = path.join(targetDir, 'screenshot_website_flyers.png');

// Use window size 1280x1600 to capture the whole flyers section
execSync(`"${chromePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=4000 --window-size=1280,1600 --screenshot="${flyersShot}" "http://localhost:3000/?scroll_to=flyers"`, { stdio: 'inherit' });

console.log('Captured screenshot_website_flyers.png');
