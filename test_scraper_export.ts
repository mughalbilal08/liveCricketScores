import { getLiveMatches } from './lib/scraper';

async function test() {
  console.log('Testing getLiveMatches()...');
  const matches = await getLiveMatches();
  console.log(`Found ${matches.length} matches.`);
  if (matches.length > 0) {
    console.log(JSON.stringify(matches[0], null, 2));
  }
}

test().catch(console.error);
