import fs from 'fs';

export default class Configuration {
    database: { user: string, password: string, host: string, port: number, database: string};
    feeds: { feedLocation: string, handlerName: string, enabled: boolean }[];

    constructor() {
        const rawdata = fs.readFileSync('config.json', 'utf8');
        const configuration = JSON.parse(rawdata.trim());

        this.database = configuration.database;
        this.feeds = configuration.feeds;
    }
}

export const configuration = new Configuration();
