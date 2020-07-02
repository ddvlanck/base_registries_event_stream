const xml2js = require('xml2js');
const parser = new xml2js.Parser();

export default class GebouwEventHandler {
  processPage(data) {
    for (let event of data.feed.entry) {
      parser.parseString(event.content, async (err, content) => {
        console.log(content);
      });
    }
  }
}
