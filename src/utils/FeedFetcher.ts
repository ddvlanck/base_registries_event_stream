import querystring from 'querystring';
import { URL } from 'url';
import fetch from 'node-fetch';
import sleep from 'sleep-promise';
import { Parser } from 'xml2js';

import AdresEventHandler from '../address-registry/AdresEventHandler';
import GemeenteEventHandler from '../municipality-registry/GemeenteEventHandler';
import PostinfoEventHandler from '../postal-information-registry/PostinfoEventHandler';
import StraatnaamEventHandler from '../streetname-registry/StraatnaamEventHandler';
import { configuration } from '../utils/Configuration';
import { db } from './DatabaseQueries';

const parser = new Parser();

export default class FeedFetcher {
  private readonly apikey: string;
  public feeds: { name: string; feedLocation: string; enabled: boolean }[];

  public constructor(apikey: string) {
    this.feeds = configuration.feeds;
    this.apikey = apikey;
  }

  public async fetchFeeds(): Promise<void> {
    const feeds = [];
    for (const feed of this.feeds) {
      if (!feed.enabled) {
        continue;
      }

      console.log(`Preparing to fetch feed: ${feed.name}.`);

      const eventFeed = this.fetchFeed(
        feed.name,
        feed.feedLocation,
      );

      feeds.push(eventFeed);
    }

    await Promise.all(feeds);
  }

  public async fetchFeed(name: string, uri: string): Promise<void> {
    const handler = this.getHandler(name);
    const lastPosition = await this.getLastProjectionPosition(name);

    console.log(`Starting ${name} projection at position ${lastPosition}.`);

    const rateLimitDelay = 100;
    const eventsPerPage = 500;
    let nextLink = new URL(`${uri}?limit=${eventsPerPage}&from=${lastPosition}&embed=event,object`);

    const headers = {
      'x-api-key': this.apikey,
    };

    while (nextLink !== null) {
      console.log(`Fetching ${nextLink}`);
      await fetch(`${nextLink}`, { headers })
        .then(res => res.text())
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        .then(async raw => {
          await parser
            .parseStringPromise(raw)
            .then(async data => {
              nextLink = this.getNextLink(data);
              console.log(`Next Link: ${nextLink}`);

              if (data.feed.entry) {
                console.log(`Processing entries for ${name}.`);

                await db.transaction(async client => {
                  await handler.processPage(client, data.feed.entry);
                  const newPosition = this.getNextFrom(nextLink);
                  console.log(`Saving position ${newPosition} for ${name} projection.`);
                  await db.setProjectionStatus(client, name, newPosition);
                });
              } else {
                console.log(`No more entries for ${name}.`);
              }
            })
            .catch(error => {
              console.error('Failed to parse page.', raw, error);
            });
        });

      console.log(`Waiting ${rateLimitDelay}ms to not trigger rate limit.`);
      await sleep(rateLimitDelay);
    }

    console.log(`Done fetching pages for [${name}]`);
  }

  public getHandler(name: string): any {
    switch (name) {
      case 'municipality':
        return new GemeenteEventHandler();

      case 'streetname':
        return new StraatnaamEventHandler();

      case 'address':
        return new AdresEventHandler();

      case 'postal_info':
        return new PostinfoEventHandler();
    }
  }

  public async getLastProjectionPosition(name: string): Promise<any> {
    const lastPosition = await db.getProjectionStatus(name);

    if (lastPosition.rows.length === 0) {
      await db.initProjectionStatus(name);
      return 0;
    }
    return lastPosition.rows[0].position;
  }

  public getNextLink(data): URL | null {
    const result = data.feed.link.filter(obj => obj.$.rel === 'next');

    return result.length > 0 ? new URL(result[0].$.href) : null;
  }

  public getNextFrom(nextLink: URL): number {
    const qs = nextLink.search.replace('?', '');
    return Number(querystring.parse(qs).from);
  }
}
