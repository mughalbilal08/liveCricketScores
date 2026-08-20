const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('C:/Users/bi443/.gemini/antigravity-ide/brain/6d5a5c61-73e2-41af-9898-e04b6f9acd2b/scratch/cricbuzz.html', 'utf8');
const $ = cheerio.load(html);

console.log("cb-mtch-lst:", $('.cb-mtch-lst').length);
console.log("cb-lv-main:", $('.cb-lv-main').length);
console.log("cb-schdl:", $('.cb-schdl').length);

const matches = [];

// Cricbuzz live matches are usually under divs with classes like cb-mtch-lst or cb-schdl or cb-lv-main
$('.cb-mtch-lst, .cb-lv-main, .cb-schdl').each((i, el) => {
    const text = $(el).text().trim();
    if (text.toLowerCase().includes('pakistan')) {
        console.log("Found Pakistan match HTML snippet:");
        console.log($(el).html());
    }
});
