const fs = require('fs');
const path = require('path');

function extractJpegs(pdfPath, prefix) {
  if (!fs.existsSync(pdfPath)) return;
  console.log('Extracting from:', pdfPath);
  const buf = fs.readFileSync(pdfPath);
  let pos = 0;
  let count = 0;
  const outDir = path.resolve('extracted_assets');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  while (pos < buf.length) {
    const start = buf.indexOf(Buffer.from([0xFF, 0xD8, 0xFF]), pos);
    if (start === -1) break;
    const end = buf.indexOf(Buffer.from([0xFF, 0xD9]), start + 3);
    if (end === -1) {
      pos = start + 3;
      continue;
    }
    const imgBuf = buf.subarray(start, end + 2);
    if (imgBuf.length > 3000) {
      count++;
      const outPath = path.join(outDir, `${prefix}_${count}_${imgBuf.length}b.jpg`);
      fs.writeFileSync(outPath, imgBuf);
      console.log(`Saved ${outPath} (${imgBuf.length} bytes)`);
    }
    pos = end + 2;
  }
}

extractJpegs(path.resolve('..', 'Menu & Coûts Restaurant Club Kickboxing.pdf'), 'menu_costs');
extractJpegs(path.resolve('..', 'SOPs_Restaurante_OLIMPO_FinalUpdate.pdf'), 'sops');
