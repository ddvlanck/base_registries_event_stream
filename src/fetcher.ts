import waitForPostgres from './../dependencies/wait-for-postgres/lib';

import { configuration } from './utils/Configuration';

import FeedFetcher from './utils/FeedFetcher';

const fetcher = new FeedFetcher();

console.log('Starting Fetcher');

(async () => {
  const connected = await waitForPostgres.wait(configuration.database);

  if (connected == 0) {
    await fetcher.fetchFeeds()
  }

  console.log('Done')
})().catch(e => console.error(e.stack));
