const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const html = `<!DOCTYPE html>
<html>
<body style="margin:0; background:transparent;">
  <canvas id="c" width="400" height="400"></canvas>
  <img id="flyer" src="file:///${path.resolve(__dirname, '..', 'extracted_assets', 'extracted_obj_5_648x956.bmp').replace(/\\/g, '/')}">
  <script>
    window.addEventListener('load', () => {
      const c = document.getElementById('c');
      const ctx = c.getContext('2d');
      const flyer = document.getElementById('flyer');
      
      // Let's draw centered on circle:
      // Exact center test:
      // x: 185, y: 175, radius ~ 111 px
      const cx = 185;
      const cy = 175;
      const r = 112;

      ctx.save();
      ctx.beginPath();
      ctx.arc(200, 200, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(flyer, cx - r, cy - r, r * 2, r * 2, 200 - r, 200 - r, r * 2, r * 2);
      ctx.restore();

      // Outer clean stroke
      ctx.beginPath();
      ctx.arc(200, 200, r - 1, 0, Math.PI * 2);
      ctx.strokeStyle = '#00d2d3';
      ctx.lineWidth = 2;
      ctx.stroke();

      window.ready = true;
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.resolve(__dirname, '..', 'tools', 'extract_logo.html'), html);
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outPng = path.resolve(__dirname, '..', 'extracted_assets', 'logo_olimpo.png');

spawnSync(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--default-background-color=00000000',
  '--allow-file-access-from-files',
  '--window-size=400,400',
  `--screenshot=${outPng}`,
  `file:///${path.resolve(__dirname, '..', 'tools', 'extract_logo.html').replace(/\\/g, '/')}`
]);

console.log('Logo extracted:', fs.existsSync(outPng));
