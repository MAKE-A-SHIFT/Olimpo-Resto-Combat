const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outTop = path.resolve(__dirname, '../preview_top_alternation.png');
const outPricing = path.resolve(__dirname, '../preview_pricing_sections.png');
const outMobile = path.resolve(__dirname, '../preview_mobile_view.png');
const outTablet = path.resolve(__dirname, '../preview_tablet_view.png');

console.log('Capturing screenshots from http://localhost:3000 ...');

try {
  // 1. Top & Facility & Club & Restaurant Alternation (1440x2600)
  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outTop}" --window-size=1440,2800 --virtual-time-budget=2000 "http://localhost:3000/#inicio"`, { stdio: 'inherit' });
  console.log('Top alternation captured:', outTop);

  // 2. Pricing & Affiliates & Contact Alternation
  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outPricing}" --window-size=1440,2800 --virtual-time-budget=2000 "http://localhost:3000/#tarifas"`, { stdio: 'inherit' });
  console.log('Pricing captured:', outPricing);

  // 3. Mobile View (390x2800)
  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outMobile}" --window-size=390,2800 --virtual-time-budget=2000 "http://localhost:3000/"`, { stdio: 'inherit' });
  console.log('Mobile captured:', outMobile);

  // 4. Tablet View (820x2600)
  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outTablet}" --window-size=820,2600 --virtual-time-budget=2000 "http://localhost:3000/"`, { stdio: 'inherit' });
  console.log('Tablet captured:', outTablet);
} catch (e) {
  console.error('Capture error:', e);
}
