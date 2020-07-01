import AdresEventHandler from "../handlers/AdresEventHandler";
import StraatnaamEventHandler from "../handlers/StraatnaamEventHandler";
import GemeenteEventHandler from "../handlers/GemeenteEventHandler";
import GebouwEventHandler from "../handlers/GebouwEventHandler";

const fs = require('fs');
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

export default class FeedFetcher {
    constructor() {
        const rawdata = fs.readFileSync('feed_config.json', 'utf8');
        const config = JSON.parse(rawdata.trim());

        for (let feed of config) {
            if (feed.enabled) {
                this.fetchFeed(feed.feedURL, feed.handlerName);
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

        console.log("Done fetching pages for [" + handlerName + "]");
    }

    getNextLink(data) {
        const result = data.feed.link.filter(obj => { return obj['$'].rel === 'next' });
        return result.length > 0 ? result[0]['$'].href : null;
    }

    getHandler(name: string) {
        switch (name) {
            case 'Adressen':
                return new AdresEventHandler();
                break;
            case 'Straatnamen':
                return new StraatnaamEventHandler();
                break;
            case 'Gemeentes':
                return new GemeenteEventHandler();
            case 'Gebouwen':
                return new GebouwEventHandler();
        }
    }
}
