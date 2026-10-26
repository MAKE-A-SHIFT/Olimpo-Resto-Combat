const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const dir = path.resolve(__dirname, '..', 'extracted_assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.bmp') || f.endsWith('.jpg') || f.endsWith('.png'));

let cards = files.map(f => {
  const fileUrl = `file:///${path.join(dir, f).replace(/\\/g, '/')}`;
  return `
    <div style="background:#1e272e; padding:10px; border-radius:8px; border:1px solid #333; text-align:center;">
      <h4 style="color:#00d2d3; margin:0 0 10px 0; font-size:12px; word-break:break-all;">${f}</h4>
      <img src="${fileUrl}" style="max-width:250px; max-height:250px; object-fit:contain; background:#000; border-radius:4px;">
    </div>
  `;
}).join('\n');

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; background: #0f141a; color: #fff; padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
  </style>
</head>
<body>
  <h2>Extracted Assets Gallery</h2>
  <div class="grid">${cards}</div>
</body>
</html>`;

const htmlPath = path.resolve(__dirname, '..', 'gallery.html');
fs.writeFileSync(htmlPath, html);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outPng = path.resolve(__dirname, '..', 'gallery_overview.png');

spawnSync(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--allow-file-access-from-files',
  '--window-size=1600,2000',
  `--screenshot=${outPng}`,
  `file:///${htmlPath.replace(/\\/g, '/')}`
]);

console.log('Gallery rendered:', fs.existsSync(outPng));
