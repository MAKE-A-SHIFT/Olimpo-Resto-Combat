const fs = require('fs');
const path = require('path');

const dir = path.resolve('extracted_assets');
const files = fs.readdirSync(dir);
console.log('Files in extracted_assets:', files);
