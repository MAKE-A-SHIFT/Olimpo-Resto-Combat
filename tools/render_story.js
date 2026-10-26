const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function render(htmlPath, outPngPath) {
  const absHtml = path.resolve(htmlPath);
  const absOut = path.resolve(outPngPath);
  
  console.log(`Rendering ${path.basename(htmlPath)} -> ${path.basename(outPngPath)}...`);
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--window-size=1080,1920',
    '--force-device-scale-factor=1',
    '--allow-file-access-from-files',
    `--screenshot=${absOut}`,
    `file:///${absHtml.replace(/\\/g, '/')}`
  ];

  const res = spawnSync(chromePath, args);
  if (fs.existsSync(absOut)) {
    const stat = fs.statSync(absOut);
    console.log(`✓ Created: ${absOut} (${(stat.size / 1024).toFixed(1)} KB)`);
    return true;
  } else {
    console.error(`✗ Failed to create: ${absOut}`);
    if (res.stderr) console.error(res.stderr.toString());
    return false;
  }
}

const target = process.argv[2] || 'stories/story_1.html';
const output = process.argv[3] || 'output_stories/story_1_lanzamiento.png';
render(target, output);
