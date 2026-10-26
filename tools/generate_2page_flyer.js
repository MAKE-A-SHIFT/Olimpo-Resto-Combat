const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = path.resolve(__dirname, 'flyer_2page_builder.html');
const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

const brainDir = 'C:\\Users\\firet\\.gemini\\antigravity\\brain\\2b13232b-dfee-4314-8871-f08523636881';
const tempPdf = path.join(brainDir, 'Menu_Oficial_2Pages.pdf');

const targetPdf1 = path.resolve(__dirname, '../stories/assets/Menu_Oficial_Restaurante_del_Olimpo.pdf');
const targetPdf2 = path.resolve(__dirname, '../Menu_Oficial_Restaurante_del_Olimpo.pdf');

console.log('Generating PDF to temporary brain path:', tempPdf);

if (fs.existsSync(tempPdf)) {
  fs.unlinkSync(tempPdf);
}

const cmd = `"${chromePath}" --headless=new --disable-gpu --no-margins --print-background --print-to-pdf="${tempPdf}" "${fileUrl}"`;
console.log('Executing Chrome print-to-pdf...');
execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(tempPdf)) {
  const stats = fs.statSync(tempPdf);
  console.log(`Temp PDF successfully created! Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  
  // Try copying to destination
  try {
    fs.copyFileSync(tempPdf, targetPdf1);
    console.log('Successfully copied to targetPdf1:', targetPdf1);
  } catch (e1) {
    console.warn('Could not copy to targetPdf1 directly (file locked):', e1.message);
  }

  try {
    fs.copyFileSync(tempPdf, targetPdf2);
    console.log('Successfully copied to targetPdf2:', targetPdf2);
  } catch (e2) {
    console.warn('Could not copy to targetPdf2 directly (file locked):', e2.message);
  }
} else {
  console.error('Temp PDF was not created!');
}
