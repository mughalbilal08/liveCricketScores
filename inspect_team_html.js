const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.goto('https://www.espncricinfo.com/live-cricket-score', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.ds-text-tight-m', { timeout: 10000 });
  
  const cardData = await page.evaluate(() => {
    const el = document.querySelector('div.ds-flex.ds-flex-col.ds-mt-2.ds-mb-2');
    if (!el) return null;
    const card = el.closest('.ds-border, [class*="ds-rounded"]');
    if (!card) return null;
    
    // Find all links in the card
    const links = Array.from(card.querySelectorAll('a')).map(a => a.href);
    return links;
  });
  
  console.log("CARD LINKS:");
  console.log(cardData);
  await browser.close();
})();
