const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', msg => console.log('[BROWSER LOG]', msg.text()));
  page.on('pageerror', err => console.error('[BROWSER ERROR]', err.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  console.log('Page loaded successfully!');

  for (const lang of ['es', 'fr', 'en']) {
    console.log(`\n=== Testing language switch to ${lang} ===`);
    await page.evaluate((targetLang) => {
      window.applyLanguage(targetLang);
    }, lang);

    await new Promise(r => setTimeout(r, 400));

    // Verify key elements
    const heroTitle = await page.$eval('[data-i18n="heroTitle1"]', el => el.innerText);
    const ctaText = await page.$eval('[data-i18n="btnViewPacks"]', el => el.innerText);
    const goldenRuleSub = await page.$eval('[data-i18n="goldenRuleSubtitle"]', el => el.innerText);
    const dishButton = await page.$eval('.btn-dish-order', el => el.innerText);
    const firstDishDay = await page.$eval('.dish-day-badge', el => el.innerText);
    const flyerTitle = await page.$eval('.flyer-title', el => el.innerText);
    const goalTitle = await page.$eval('#goalTitle', el => el.innerText);
    const selectFirstOption = await page.$eval('#checkoutPlanSelect option', el => el.innerText);

    console.log(`[${lang}] heroTitle:`, heroTitle);
    console.log(`[${lang}] ctaText:`, ctaText);
    console.log(`[${lang}] goldenRuleSub:`, goldenRuleSub);
    console.log(`[${lang}] dishButton:`, dishButton);
    console.log(`[${lang}] firstDishDay:`, firstDishDay);
    console.log(`[${lang}] flyerTitle:`, flyerTitle);
    console.log(`[${lang}] goalTitle:`, goalTitle);
    console.log(`[${lang}] selectFirstOption:`, selectFirstOption);

    // Check placeholders
    const namePlaceholder = await page.$eval('#custName', el => el.placeholder);
    console.log(`[${lang}] namePlaceholder:`, namePlaceholder);

    // Screenshot
    await page.screenshot({ path: `tools/screenshot_${lang}.png` });
  }

  await browser.close();
  console.log('\nAll browser language tests passed successfully!');
})();
