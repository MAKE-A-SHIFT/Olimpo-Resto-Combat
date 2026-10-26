const http = require('http');
const { execSync } = require('child_process');
const path = require('path');

console.log('Testing http://localhost:3000...');

http.get('http://localhost:3000/', (res) => {
  console.log('HTTP Status:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTML length received:', data.length, 'bytes');
    console.log('Contains Bristol de Areguá:', data.includes('Bristol de Areguá'));
    console.log('Contains data-i18n:', data.includes('data-i18n'));
    console.log('Contains singleDishGroup:', data.includes('singleDishGroup'));

    // Now test with Chrome headless against localhost URL
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const outPng = path.resolve(__dirname, '../localhost_preview.png');
    console.log('Taking screenshot of http://localhost:3000/?ref=CHAMPION_AREGUA ...');
    try {
      execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outPng}" --window-size=1440,3200 --virtual-time-budget=2000 "http://localhost:3000/?ref=CHAMPION_AREGUA"`, { stdio: 'inherit' });
      console.log('Saved localhost screenshot to:', outPng);
    } catch (e) {
      console.error('Screenshot error:', e);
    }
  });
}).on('error', (err) => {
  console.error('Connection error:', err);
});
