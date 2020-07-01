import fetch from 'node-fetch';
import xml2js from 'xml2js';

import { configuration } from '../utils/Configuration';

import AdresEventHandler from '../handlers/AdresEventHandler';
import StraatnaamEventHandler from '../handlers/StraatnaamEventHandler';
import GemeenteEventHandler from '../handlers/GemeenteEventHandler';
import GebouwEventHandler from '../handlers/GebouwEventHandler';

const parser = new xml2js.Parser();

export default class FeedFetcher {
  feeds: { feedLocation: string, handlerName: string, enabled: boolean }[];

  constructor() {
    this.feeds = configuration.feeds;
  }

  async fetchFeeds() {
    for (let feed of this.feeds) {
      if (feed.enabled) {
        await this.fetchFeed(feed.feedLocation, feed.handlerName);
      }
    }
  }

  async fetchFeed(uri: string, handlerName: string) {
    let nextLink = uri;
    const handler = this.getHandler(handlerName);

    //while(nextLink !== null){
    await fetch(nextLink).then(res => res.text()).then(raw => {
      parser.parseString(raw, (err, data) => {
        nextLink = this.getNextLink(data);
        if (data.feed.entry) {
          handler.processPage(data);
        }
      })
    });
    //}

    console.log('Done fetching pages for [' + handlerName + ']');
  }

  getNextLink(data) {
    const result = data.feed.link.filter(obj => { return obj['$'].rel === 'next' });
    return result.length > 0 ? result[0]['$'].href : null;
  }

  getHandler(name: string) {
    switch (name) {
      case 'Adressen':
        return new AdresEventHandler();

      case 'Straatnamen':
        return new StraatnaamEventHandler();

      case 'Gemeentes':
        return new GemeenteEventHandler();

      case 'Gebouwen':
        return new GebouwEventHandler();
    }
  }
}
