const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const html = `<!DOCTYPE html>
<html>
<body style="margin:0; background:transparent;">
  <canvas id="c" width="500" height="500"></canvas>
  <img id="flyer" src="file:///${path.resolve(__dirname, '..', 'extracted_assets', 'extracted_obj_5_648x956.bmp').replace(/\\/g, '/')}">
  <script>
    window.addEventListener('load', () => {
      const c = document.getElementById('c');
      const ctx = c.getContext('2d');
      const flyer = document.getElementById('flyer');
      
      const cx = 156;
      const cy = 174;
      const r = 95.5;

      ctx.save();
      ctx.beginPath();
      ctx.arc(250, 250, 240, 0, Math.PI * 2);
      ctx.clip();

      // High quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(flyer, cx - r, cy - r, r * 2, r * 2, 10, 10, 480, 480);
      ctx.restore();

      // Crisp outer glow / border ring
      ctx.beginPath();
      ctx.arc(250, 250, 240, 0, Math.PI * 2);
      ctx.strokeStyle = '#00d2d3';
      ctx.lineWidth = 4;
      ctx.stroke();

      window.ready = true;
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.resolve(__dirname, '..', 'tools', 'generate_logo.html'), html);
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outPng = path.resolve(__dirname, '..', 'extracted_assets', 'logo_olimpo.png');

spawnSync(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--default-background-color=00000000',
  '--allow-file-access-from-files',
  '--window-size=500,500',
  `--screenshot=${outPng}`,
  `file:///${path.resolve(__dirname, '..', 'tools', 'generate_logo.html').replace(/\\/g, '/')}`
]);

console.log('Final logo generated:', fs.existsSync(outPng));
