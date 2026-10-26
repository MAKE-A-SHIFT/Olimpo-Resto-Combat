const fs = require('fs');
const path = require('path');

const pdfPath = path.resolve(__dirname, '../stories/assets/Menu_Oficial_Restaurante_del_Olimpo.pdf');
const content = fs.readFileSync(pdfPath, 'utf8', { encoding: 'latin1' });

// Count /Type /Page (excluding /Type /Pages)
const pageMatches = content.match(/\/Type\s*\/Page[^s]/g);
console.log('Matches for /Type /Page:', pageMatches ? pageMatches.length : 0);

// Look for /Count
const countMatches = content.match(/\/Count\s+(\d+)/g);
console.log('Matches for /Count:', countMatches);
