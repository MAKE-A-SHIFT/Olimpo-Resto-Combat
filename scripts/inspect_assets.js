const fs = require('fs');
const path = require('path');

function getJpegDimensions(buf) {
  let i = 0;
  if (buf[i] !== 0xFF || buf[i + 1] !== 0xD8) return null;
  i += 2;
  while (i < buf.length) {
    if (buf[i] !== 0xFF) break;
    const marker = buf[i + 1];
    if (marker === 0xD9 || marker === 0xDA) break;
    const len = buf.readUInt16BE(i + 2);
    if ([0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF].includes(marker)) {
      const height = buf.readUInt16BE(i + 5);
      const width = buf.readUInt16BE(i + 7);
      return { width, height };
    }
    i += 2 + len;
  }
  return null;
}

function getPngDimensions(buf) {
  if (buf.length < 24) return null;
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

const dir = path.resolve('extracted_assets');
const files = fs.readdirSync(dir);
for (const f of files) {
  const p = path.join(dir, f);
  const buf = fs.readFileSync(p);
  const dims = f.endsWith('.png') ? getPngDimensions(buf) : getJpegDimensions(buf);
  console.log(`${f}: ${buf.length} bytes, dims: ${dims ? `${dims.width}x${dims.height}` : 'unknown'}`);
}

const promo = path.resolve('..', 'Promo de Lancement OLYMPE.png');
if (fs.existsSync(promo)) {
  const pBuf = fs.readFileSync(promo);
  console.log('Promo de Lancement OLYMPE.png:', pBuf.length, 'bytes, dims:', getPngDimensions(pBuf));
  fs.copyFileSync(promo, path.join(dir, 'Promo_de_Lancement_OLYMPE.png'));
}
