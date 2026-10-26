const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dir = path.resolve('extracted_assets');
for (const f of fs.readdirSync(dir)) {
  const p = path.join(dir, f);
  const buf = fs.readFileSync(p);
  const hash = crypto.createHash('md5').update(buf).digest('hex');
  console.log(`${f} - MD5: ${hash} - Size: ${buf.length}`);
}
