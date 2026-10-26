const { execSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outFull = path.resolve(__dirname, '../preview_complete_site.png');

console.log('Rendering complete site...');
execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outFull}" --window-size=1440,9200 --virtual-time-budget=3000 "http://localhost:3000/"`, { stdio: 'inherit' });
console.log('Saved to:', outFull);
