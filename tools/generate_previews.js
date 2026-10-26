const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const brainDir = 'C:\\Users\\firet\\.gemini\\antigravity\\brain\\2b13232b-dfee-4314-8871-f08523636881';

const rectoUrl = 'file:///' + path.resolve(__dirname, 'flyer_recto.html').replace(/\\/g, '/');
const versoUrl = 'file:///' + path.resolve(__dirname, 'flyer_verso.html').replace(/\\/g, '/');
const twoPagesUrl = 'file:///' + path.resolve(__dirname, 'flyer_2page_builder.html').replace(/\\/g, '/');

const brainRecto = path.join(brainDir, 'flyer_recto_preview.png');
const brainVerso = path.join(brainDir, 'flyer_verso_preview.png');
const brainPdf = path.join(brainDir, 'Menu_Oficial_2Pages.pdf');

console.log('1. Rendering PDF...');
execSync(`"${chromePath}" --headless=new --disable-gpu --no-margins --print-background --print-to-pdf="${brainPdf}" "${twoPagesUrl}"`, { stdio: 'inherit' });

console.log('2. Rendering Recto Screenshot...');
execSync(`"${chromePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --window-size=794,1123 --screenshot="${brainRecto}" "${rectoUrl}"`, { stdio: 'inherit' });

console.log('3. Rendering Verso Screenshot...');
execSync(`"${chromePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --window-size=794,1123 --screenshot="${brainVerso}" "${versoUrl}"`, { stdio: 'inherit' });

// Copy PDF
const targetPdf1 = path.resolve(__dirname, '../stories/assets/Menu_Oficial_Restaurante_del_Olimpo.pdf');
const targetPdf2 = path.resolve(__dirname, '../Menu_Oficial_Restaurante_del_Olimpo.pdf');
fs.copyFileSync(brainPdf, targetPdf1);
fs.copyFileSync(brainPdf, targetPdf2);
console.log('Updated PDFs:', targetPdf1, targetPdf2);

// Copy Previews
fs.copyFileSync(brainRecto, path.resolve(__dirname, '../stories/assets/flyer_recto_preview.png'));
fs.copyFileSync(brainRecto, path.resolve(__dirname, '../flyer_recto_preview.png'));

fs.copyFileSync(brainVerso, path.resolve(__dirname, '../stories/assets/flyer_verso_preview.png'));
fs.copyFileSync(brainVerso, path.resolve(__dirname, '../flyer_verso_preview.png'));

console.log('Updated previews in stories/assets and root!');
