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
  
  const matches = await page.evaluate(() => {
    const el = document.querySelector('div.ds-flex.ds-flex-col.ds-mt-2.ds-mb-2');
    if (!el) return null;
    const teamRows = el.querySelectorAll('.ds-flex.ds-justify-between.ds-items-center');
    if (teamRows.length >= 2) {
      return {
        team1Html: teamRows[0].innerHTML,
        team2Html: teamRows[1].innerHTML
      };
    }
    return null;
  });
  
  console.log("TEAM HTML:");
  console.log(matches);
  
  await browser.close();
})();
