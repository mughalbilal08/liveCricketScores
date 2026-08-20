const puppeteer = require('puppeteer');

async function scrape() {
  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log("Navigating to Cricbuzz...");
  await page.goto('https://www.cricbuzz.com/cricket-match/live-scores', { waitUntil: 'domcontentloaded' });
  
  console.log("Waiting for selector...");
  try {
      await page.waitForSelector('.cb-mtch-lst', { timeout: 10000 });
  } catch(e) {
      console.log("Selector not found within timeout. Trying to extract anyway.");
  }
  
  console.log("Extracting match text...");
  const data = await page.evaluate(() => {
    const matches = [];
    document.querySelectorAll('.cb-mtch-lst, .cb-lv-main, .cb-schdl').forEach(el => {
      matches.push(el.innerText.trim());
    });
    return {
       matches,
       title: document.title,
       htmlSnippet: document.body.innerHTML.substring(0, 500)
    };
  });
  
  console.log(`Title: ${data.title}`);
  console.log(`Found ${data.matches.length} matches.`);
  if (data.matches.length > 0) {
     console.log("Sample:", data.matches[0].substring(0, 100));
  } else {
     console.log("HTML:", data.htmlSnippet);
  }
  
  await browser.close();
}

scrape().catch(console.error);
