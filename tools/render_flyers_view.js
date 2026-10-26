const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const brainDir = 'C:\\Users\\firet\\.gemini\\antigravity\\brain\\2b13232b-dfee-4314-8871-f08523636881';
const outFlyersDesktop = path.join(brainDir, 'screenshot_flyers_section_desktop.png');
const outFlyersMobile = path.join(brainDir, 'screenshot_flyers_section_mobile.png');

const indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

// Hide everything except the navbar and flyers section
const scriptToInject = `
<script>
  window.addEventListener('DOMContentLoaded', () => {
    const toHide = ['inicio', 'complejo', 'club', 'restaurante', 'tarifas', 'checkoutModal', 'afiliados', 'faq', 'contacto'];
    toHide.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  });
</script>
`;

const modifiedHtml = indexHtml.replace('</body>', scriptToInject + '</body>');
const tmpFile = path.resolve(__dirname, 'preview_flyers_only.html');
fs.writeFileSync(tmpFile, modifiedHtml, 'utf8');

const fileUrl = 'file:///' + tmpFile.replace(/\\/g, '/');

console.log('Capturing Desktop Flyers View...');
execSync(`"${chromePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --window-size=1280,1100 --screenshot="${outFlyersDesktop}" "${fileUrl}"`, { stdio: 'inherit' });

console.log('Capturing Mobile Flyers View...');
execSync(`"${chromePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --window-size=400,1650 --screenshot="${outFlyersMobile}" "${fileUrl}"`, { stdio: 'inherit' });

console.log('Screenshots generated:');
console.log(outFlyersDesktop);
console.log(outFlyersMobile);
