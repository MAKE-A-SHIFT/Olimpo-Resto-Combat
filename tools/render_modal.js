const { execSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
const outPng = path.resolve(__dirname, '../site_render_modal.png');

console.log('Rendering modal checkout...');
// We can use a small HTML wrapper or JS injected
const wrapperHtml = path.resolve(__dirname, '../modal_preview.html');
const originalHtml = require('fs').readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const modifiedHtml = originalHtml.replace('<div class="modal-backdrop" id="checkoutModal">', '<div class="modal-backdrop open" id="checkoutModal">');
require('fs').writeFileSync(wrapperHtml, modifiedHtml, 'utf8');

const wrapperUrl = 'file:///' + wrapperHtml.replace(/\\/g, '/');
try {
  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outPng}" --window-size=1440,1200 --virtual-time-budget=2000 "${wrapperUrl}"`, { stdio: 'inherit' });
  console.log('Modal rendered successfully to:', outPng);
} catch (err) {
  console.error('Error:', err);
}
