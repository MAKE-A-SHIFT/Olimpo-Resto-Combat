const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outBottom = path.resolve(__dirname, '../preview_bottom_alternation.png');

// Create a wrapper that scrolls down to #tarifas on load
const indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const scrolledHtml = indexHtml.replace('</body>', '<script>window.addEventListener("load", () => { document.getElementById("tarifas").scrollIntoView(); });</script></body>');
const tmpFile = path.resolve(__dirname, '../scrolled_preview.html');
fs.writeFileSync(tmpFile, scrolledHtml, 'utf8');

const fileUrl = 'file:///' + tmpFile.replace(/\\/g, '/');
execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outBottom}" --window-size=1440,2400 --virtual-time-budget=2000 "${fileUrl}"`, { stdio: 'inherit' });
console.log('Bottom half captured:', outBottom);
