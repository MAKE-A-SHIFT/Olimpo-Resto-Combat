const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const pdfPath = path.resolve('..', 'Restaurante del OLIMPO.pdf');
const buf = fs.readFileSync(pdfPath);
const str = buf.toString('latin1');

console.log('Searching for /Subtype /Image...');
let regex = /<<([^>]*\/Subtype\s*\/Image[^>]*)>>\s*stream\r?\n/g;
let match;
let count = 0;

while ((match = regex.exec(str)) !== null) {
  count++;
  const dict = match[1];
  const streamStart = match.index + match[0].length;
  // find length
  let lenMatch = dict.match(/\/Length\s+(\d+)/);
  let filterMatch = dict.match(/\/Filter\s*(\/[A-Za-z0-9]+|\[[^\]]+\])/);
  let widthMatch = dict.match(/\/Width\s+(\d+)/);
  let heightMatch = dict.match(/\/Height\s+(\d+)/);
  console.log(`Image ${count}: Width=${widthMatch ? widthMatch[1] : '?'}, Height=${heightMatch ? heightMatch[1] : '?'}, Filter=${filterMatch ? filterMatch[1] : 'none'}, Length=${lenMatch ? lenMatch[1] : '?'}`);
}
console.log(`Total PDF image objects found: ${count}`);
