const puppeteer = require('puppeteer');

async function scrape() {
  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const page = await browser.newPage();
  
  console.log("Navigating to ESPNcricinfo to get cookies...");
  await page.goto('https://www.espncricinfo.com/live-cricket-score', { waitUntil: 'domcontentloaded' });
  
  console.log("Evaluating fetch...");
  const msgId = "lm-en-" + Date.now();
  const data = await page.evaluate(async (msgId) => {
    const res = await fetch(`https://hs-consumer-api.espncricinfo.com/v1/global/fastscore/message/base?messageId=${msgId}`, {
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    });
    if (!res.ok) throw new Error("API failed " + res.status);
    return await res.json();
  }, msgId);
  
  console.log("Matches:", data.matches?.length || 0);
  require('fs').writeFileSync('C:/Users/bi443/.gemini/antigravity-ide/brain/6d5a5c61-73e2-41af-9898-e04b6f9acd2b/scratch/fastscore.json', JSON.stringify(data, null, 2));
  
  await browser.close();
}

scrape().catch(console.error);
