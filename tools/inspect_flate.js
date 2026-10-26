const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const pdfPath = path.resolve('..', 'Restaurante del OLIMPO.pdf');
const buf = fs.readFileSync(pdfPath);
const str = buf.toString('latin1');

let regex = /<<([^>]*\/Subtype\s*\/Image[^>]*)>>\s*stream\r?\n/g;
let match;
let count = 0;

const outDir = path.resolve('extracted_assets');

while ((match = regex.exec(str)) !== null) {
  count++;
  const dict = match[1];
  const streamStart = match.index + match[0].length;
  
  let lenMatch = dict.match(/\/Length\s+(\d+)/);
  let filterMatch = dict.match(/\/Filter\s*(\/[A-Za-z0-9]+|\[[^\]]+\])/);
  let widthMatch = dict.match(/\/Width\s+(\d+)/);
  let heightMatch = dict.match(/\/Height\s+(\d+)/);
  let csMatch = dict.match(/\/ColorSpace\s*(\/[A-Za-z0-9]+|\[[^\]]+\])/);
  let bpcMatch = dict.match(/\/BitsPerComponent\s+(\d+)/);
  let decodeParmsMatch = dict.match(/\/DecodeParms\s*<<([^>]*)>>/);

  const len = lenMatch ? parseInt(lenMatch[1], 10) : 0;
  const filter = filterMatch ? filterMatch[1] : '';
  const width = widthMatch ? parseInt(widthMatch[1], 10) : 0;
  const height = heightMatch ? parseInt(heightMatch[1], 10) : 0;
  const colorSpace = csMatch ? csMatch[1] : '';
  const bpc = bpcMatch ? parseInt(bpcMatch[1], 10) : 8;

  console.log(`Obj ${count}: ${width}x${height}, filter: ${filter}, len: ${len}, cs: ${colorSpace}, bpc: ${bpc}, dp: ${decodeParmsMatch ? decodeParmsMatch[1] : ''}`);

  if (filter === '/FlateDecode') {
    const rawStream = buf.subarray(streamStart, streamStart + len);
    try {
      const decompressed = zlib.inflateSync(rawStream);
      console.log(`  Decompressed size: ${decompressed.length} bytes (expected ${width * height * (colorSpace.includes('DeviceRGB') ? 3 : 4)} bytes)`);
      fs.writeFileSync(path.join(outDir, `raw_flate_${count}_${width}x${height}.bin`), decompressed);
    } catch (e) {
      console.error(`  Error inflating: ${e.message}`);
    }
  }
}
