const fs = require('fs');
const path = require('path');

const pdfPath = path.resolve('..', 'Restaurante del OLIMPO.pdf');
console.log('Reading:', pdfPath);
if (!fs.existsSync(pdfPath)) {
  console.error('File not found:', pdfPath);
  process.exit(1);
}

const buf = fs.readFileSync(pdfPath);
console.log('PDF Size:', buf.length, 'bytes');

const outDir = path.resolve('extracted_assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

let pos = 0;
let count = 0;

while (pos < buf.length) {
  const start = buf.indexOf(Buffer.from([0xFF, 0xD8, 0xFF]), pos);
  if (start === -1) break;
  const end = buf.indexOf(Buffer.from([0xFF, 0xD9]), start + 3);
  if (end === -1) {
    pos = start + 3;
    continue;
  }
  const imgBuf = buf.subarray(start, end + 2);
  // filter out tiny thumbnails if any, or keep all
  if (imgBuf.length > 5000) {
    count++;
    const outPath = path.join(outDir, `img_${count}_${imgBuf.length}b.jpg`);
    fs.writeFileSync(outPath, imgBuf);
    console.log(`Extracted image ${count} (${imgBuf.length} bytes)`);
  }
  pos = end + 2;
}

// Also check for PNGs (89 50 4E 47 0D 0A 1A 0A ... 49 45 4E 44 AE 42 60 82)
let pngPos = 0;
let pngCount = 0;
const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const pngFooter = Buffer.from([0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);

while (pngPos < buf.length) {
  const start = buf.indexOf(pngHeader, pngPos);
  if (start === -1) break;
  const end = buf.indexOf(pngFooter, start + 8);
  if (end === -1) {
    pngPos = start + 8;
    continue;
  }
  const imgBuf = buf.subarray(start, end + 8);
  pngCount++;
  const outPath = path.join(outDir, `png_${pngCount}_${imgBuf.length}b.png`);
  fs.writeFileSync(outPath, imgBuf);
  console.log(`Extracted PNG ${pngCount} (${imgBuf.length} bytes)`);
  pngPos = end + 8;
}

console.log(`Total extracted: ${count} JPEGs, ${pngCount} PNGs`);
