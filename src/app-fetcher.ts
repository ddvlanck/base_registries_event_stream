import waitForPostgres from './../dependencies/wait-for-postgres/lib';

import { configuration } from './utils/Configuration';

import FeedFetcher from "./utils/FeedFetcher";

const fetcher = new FeedFetcher();

waitForPostgres
  .wait(configuration.database)
  .then(fetcher.fetchFeeds());
