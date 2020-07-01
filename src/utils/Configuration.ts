import fs from 'fs';

export default class Configuration {
  database: { username: string, password: string, host: string, port: number, database: string };
  feeds: { feedLocation: string, handlerName: string, enabled: boolean }[];

  constructor() {
    const rawdata = fs.readFileSync('config.json', 'utf8');
    const configuration = JSON.parse(rawdata.trim());

    this.database = configuration.database;
    this.feeds = configuration.feeds;

    this.database.username = process.env.DB_USER || this.database.username;
    this.database.password = process.env.DB_PASSWORD || this.database.password;
    this.database.host = process.env.DB_HOST || this.database.host;
    this.database.database = process.env.DB_DATABASE || this.database.database;

    if ('DB_PORT' in process.env) {
      this.database.port = Number(process.env.DB_PORT);
    }
  }
}

export const configuration = new Configuration();
