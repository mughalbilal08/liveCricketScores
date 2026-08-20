const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('page.html', 'utf8');
const $ = cheerio.load(html);

// Find elements containing "PAK" or "Pakistan"
console.log("Elements with text 'PAK':");
$(':contains("PAK")').each((i, el) => {
  // Only get the innermost elements
  if ($(el).children().length === 0) {
    console.log("Tag:", el.tagName, "Class:", $(el).attr('class'), "Text:", $(el).text().trim());
    // Also print parent classes
    console.log("Parent Class:", $(el).parent().attr('class'));
    console.log("Grandparent Class:", $(el).parent().parent().attr('class'));
    console.log("-------------------");
  }
});
