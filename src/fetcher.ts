const { Command } = require('commander');
const program = new Command();
import { pool } from './utils/DatabaseConfiguration';
import FeedFetcher from './utils/FeedFetcher';

program
  .usage('starts fetching the configured event streams from the address en building registry in Flanders.')
  .option('--apikey <key>', 'api key needed to get authentication to fetch event streams');

program.parse(process.argv);
const options = program.opts();
const apikey = process.env.API_KEY || options.apikey;

if(!apikey){
  console.log(`[Fetcher]: Did not receive an api key. Unable to fetch event streams. Quiting...`)
  process.exit(1);
}

console.log(`[Fetcher]: Received api key. Starting Fetcher...`);
const fetcher = new FeedFetcher(apikey);

pool.connect(async (err, client, release) => {
  if(err){
    return console.error(`[Server]: Error trying to connect to database. Printing error:`, err.stack);
  }

  await fetcher.fetchFeeds();
});
