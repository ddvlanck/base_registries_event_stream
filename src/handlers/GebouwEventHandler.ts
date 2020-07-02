import {PoolClient} from "pg";

const xml2js = require('xml2js');
const parser = new xml2js.Parser();

export default class GebouwEventHandler {
  async processPage(client: PoolClient, entries: Array<any>) {
    //await this.processEvents(client, entries);
  }
}
