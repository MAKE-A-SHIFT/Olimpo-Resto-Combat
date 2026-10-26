const fs = require('fs');
const path = require('path');

function createBmp(width, height, rgbBuffer) {
  // BMP row size padded to multiple of 4 bytes
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const header = Buffer.alloc(54);
  // BM magic
  header.write('BM', 0);
  // File size
  header.writeUInt32LE(fileSize, 2);
  // Reserved (4 bytes)
  header.writeUInt32LE(0, 6);
  // Offset to pixel array
  header.writeUInt32LE(54, 10);
  // DIB Header size (BITMAPINFOHEADER = 40)
  header.writeUInt32LE(40, 14);
  // Width
  header.writeInt32LE(width, 18);
  // Height (positive = bottom-up, negative = top-down)
  header.writeInt32LE(-height, 22); // negative means top-down!
  // Planes
  header.writeUInt16LE(1, 26);
  // Bits per pixel
  header.writeUInt16LE(24, 28);
  // Compression (0 = BI_RGB)
  header.writeUInt32LE(0, 30);
  // Image size
  header.writeUInt32LE(pixelArraySize, 34);
  // X pixels per meter
  header.writeInt32LE(2835, 38);
  // Y pixels per meter
  header.writeInt32LE(2835, 42);
  // Colors in color table
  header.writeUInt32LE(0, 46);
  // Important color count
  header.writeUInt32LE(0, 50);

  const pixelData = Buffer.alloc(pixelArraySize);
  for (let y = 0; y < height; y++) {
    const srcRowStart = y * width * 3;
    const dstRowStart = y * rowSize;
    for (let x = 0; x < width; x++) {
      const r = rgbBuffer[srcRowStart + x * 3];
      const g = rgbBuffer[srcRowStart + x * 3 + 1];
      const b = rgbBuffer[srcRowStart + x * 3 + 2];
      // BMP is BGR
      pixelData[dstRowStart + x * 3] = b;
      pixelData[dstRowStart + x * 3 + 1] = g;
      pixelData[dstRowStart + x * 3 + 2] = r;
    }
  }

  return Buffer.concat([header, pixelData]);
}

const dir = path.resolve('extracted_assets');
const files = fs.readdirSync(dir).filter(f => f.startsWith('raw_flate_') && f.endsWith('.bin'));

for (const file of files) {
  // raw_flate_5_648x956.bin
  const match = file.match(/raw_flate_(\d+)_(\d+)x(\d+)\.bin/);
  if (!match) continue;
  const [_, id, wStr, hStr] = match;
  const width = parseInt(wStr, 10);
  const height = parseInt(hStr, 10);
  const rgbBuf = fs.readFileSync(path.join(dir, file));
  const bmpBuf = createBmp(width, height, rgbBuf);
  const outPath = path.join(dir, `extracted_obj_${id}_${width}x${height}.bmp`);
  fs.writeFileSync(outPath, bmpBuf);
  console.log(`Saved ${outPath} (${bmpBuf.length} bytes)`);
}
