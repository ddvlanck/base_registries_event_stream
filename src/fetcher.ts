const { Command } = require('commander');
const program = new Command();
import waitForPostgres from './../dependencies/wait-for-postgres/lib';
import { configuration } from './utils/Configuration';
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

(async () => {
  const connected = await waitForPostgres.wait(configuration.database);

  if (connected == 0) {
    await fetcher.fetchFeeds()
  }

  console.log('Done')
})().catch(e => console.error(e.stack));
