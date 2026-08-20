const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log("Navigating...");
  const response = await page.goto('https://www.espncricinfo.com/live-cricket-score', { waitUntil: 'domcontentloaded' });
  console.log("Response status:", response.status());

  console.log("Taking screenshot...");
  await page.screenshot({ path: 'test_screenshot.png' });
  
  const content = await page.content();
  const fs = require('fs');
  fs.writeFileSync('page.html', content);
  console.log("Saved page.html");
  
  await browser.close();
})();
