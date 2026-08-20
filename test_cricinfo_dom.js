const puppeteer = require('puppeteer');

async function scrape() {
  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  await page.goto('https://www.espncricinfo.com/live-cricket-score', { waitUntil: 'domcontentloaded' });
  
  try {
      await page.waitForSelector('.ds-text-tight-m', { timeout: 10000 });
  } catch(e) {}
  
  const data = await page.evaluate(() => {
    const el = document.querySelector('div.ds-flex.ds-flex-col.ds-mt-2.ds-mb-2');
    if (!el) return null;
    
    // Find the closest parent that has a reasonable class to be the card
    // Or just grab a large chunk of HTML around this element
    let html = '';
    let current = el;
    for(let i=0; i<3; i++) {
        if(current.parentElement) current = current.parentElement;
    }
    html = current.outerHTML;
    
    return html;
  });
  
  console.log(data);
  await browser.close();
}

scrape().catch(console.error);
