const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outBottom = path.resolve(__dirname, '../preview_complete_bottom.png');

// Create a wrapper that removes top sections or scrolls to #tarifas
const indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const scriptToInject = `
<script>
  window.addEventListener('DOMContentLoaded', () => {
    // Hide top sections to screenshot directly from #tarifas down to footer
    const toHide = ['inicio', 'complejo', 'club', 'restaurante', 'flyers'];
    toHide.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  });
</script>
`;
const modifiedHtml = indexHtml.replace('</body>', scriptToInject + '</body>');
const tmpFile = path.resolve(__dirname, '../preview_bottom_only.html');
fs.writeFileSync(tmpFile, modifiedHtml, 'utf8');

const fileUrl = 'file:///' + tmpFile.replace(/\\/g, '/');
execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outBottom}" --window-size=1440,3800 --virtual-time-budget=2000 "${fileUrl}"`, { stdio: 'inherit' });
console.log('Saved bottom to:', outBottom);
