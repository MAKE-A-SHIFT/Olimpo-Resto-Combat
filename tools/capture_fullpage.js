const { execSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetDir = 'C:\\Users\\firet\\.gemini\\antigravity\\brain\\2b13232b-dfee-4314-8871-f08523636881';

const fullBottom = path.join(targetDir, 'screenshot_complete_bottom.png');

console.log('Capturing complete page (1280x9500)...');
execSync(`"${chromePath}" --headless=new --disable-gpu --window-size=1280,9500 --screenshot="${fullBottom}" "http://localhost:3000"`);

console.log('Done full bottom capture.');
