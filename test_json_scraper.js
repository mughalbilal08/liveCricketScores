const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('page.html', 'utf8');
const $ = cheerio.load(html);

const nextDataText = $('#__NEXT_DATA__').html();
if (nextDataText) {
  const nextData = JSON.parse(nextDataText);
  console.log(Object.keys(nextData));
  fs.writeFileSync('nextData.json', JSON.stringify(nextData, null, 2));
  console.log("Saved nextData.json");
} else {
  console.log("No __NEXT_DATA__ found!");
}
