const cheerio = require('cheerio');

async function scrapeCricbuzz() {
  const res = await fetch('https://www.cricbuzz.com/cricket-match/live-scores');
  if (!res.ok) {
    throw new Error("Failed to fetch cricbuzz: " + res.status);
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log("cb-mtch-lst:", $('.cb-mtch-lst').length);
  console.log("cb-lv-main:", $('.cb-lv-main').length);
  console.log("cb-schdl:", $('.cb-schdl').length);
  
  const matches = [];
  $('.cb-mtch-lst, .cb-lv-main, .cb-schdl').each((i, el) => {
    const text = $(el).text().trim();
    if (text.toLowerCase().includes('pakistan')) {
        console.log("Found Pakistan match:");
        console.log($(el).text().substring(0, 100));
    }
  });
  
  console.log("Total matched elements:", $('.cb-mtch-lst, .cb-lv-main, .cb-schdl').length);
}

scrapeCricbuzz().catch(console.error);
