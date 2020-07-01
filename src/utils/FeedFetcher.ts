import fetch from 'node-fetch';
import xml2js from 'xml2js';
import querystring from 'querystring';

import { configuration } from '../utils/Configuration';
import { db } from '../utils/Db';

import AdresEventHandler from '../handlers/AdresEventHandler';
import StraatnaamEventHandler from '../handlers/StraatnaamEventHandler';
import GemeenteEventHandler from '../handlers/GemeenteEventHandler';
import GebouwEventHandler from '../handlers/GebouwEventHandler';

const parser = new xml2js.Parser();

export default class FeedFetcher {
  feeds: { name: string, feedLocation: string, enabled: boolean }[];

  constructor() {
    this.feeds = configuration.feeds;
  }

  async fetchFeeds() {
    for (let feed of this.feeds) {
      if (!feed.enabled)
        continue;

      console.log(`Preparing to fetch feed: ${feed.name}.`);

      await this.fetchFeed(
        feed.name,
        feed.feedLocation);
    }
  }

  async fetchFeed(name: string, uri: string) {
    const self = this;
    const handler = this.getHandler(name);
    const lastPosition = await this.getLastProjectionPosition(name);

    console.log(`Starting ${name} projection at position ${lastPosition}.`);

    // TODO: maybe need to add limit=500 too
    let nextLink = `${uri}&from=${lastPosition}`;

    //while(nextLink !== null){

    console.log(`Fetching ${nextLink}`);
    await fetch(nextLink)
      .then(res => res.text())
      .then(async raw => {
        await parser
          .parseStringPromise(raw)
          .then(async function (data) {
            nextLink = self.getNextLink(data);
            console.log(`Next Link: ${nextLink}`);

            if (data.feed.entry) {
              console.log(`Processing entries for ${name}.`);
              await handler.processPage(data.feed.entry);

              const newPosition = Number(querystring.parse(nextLink).from);
              console.log(`Saving position ${newPosition} for ${name} projection.`);
              await db.setProjectionStatus(name, newPosition);
            } else {
              console.log(`No more entries for ${name}.`);
            }
          })
          .catch(function (err) {
            console.log('Failed to parse page.', err);
          });
      });

    //}

    console.log('Done fetching pages for [' + name + ']');
  }

  getHandler(name: string) {
    switch (name) {
      case 'municipality':
        return new GemeenteEventHandler();

      case 'streetname':
        return new StraatnaamEventHandler();

      case 'address':
        return new AdresEventHandler();

      case 'building':
        return new GebouwEventHandler();
    }
  }

  async getLastProjectionPosition(name: string) {
    const lastPosition = await db.getProjectionStatus(name);

    if (lastPosition.rows.length === 0) {
      await db.initProjectionStatus(name);
      return 0;
    } else {
      return lastPosition.rows[0].position;
    }
  }

  getNextLink(data) {
    const result = data.feed.link.filter(obj => {
      return obj['$'].rel === 'next'
    });

    return result.length > 0 ? result[0]['$'].href : null;
  }
}
