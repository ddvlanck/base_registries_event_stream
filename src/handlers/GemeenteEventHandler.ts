// import { insertValues, MUNICIPALITY_QUERY } from "../utils/Postgres";

// const xml2js = require('xml2js');
// const parser = new xml2js.Parser();

export default class GemeenteEventHandler {
  processPage(data) {
//     for (let event of data.feed.entry) {
//       parser.parseString(event.content, async (err, content) => {

//         let names = [];
//         let nameLanguages = [];
//         let officialLanguages = [];

//         if (typeof content.Content.Object[0].Gemeentenamen[0] === 'object') {
//           for (let object of content.Content.Object[0].Gemeentenamen[0].GeografischeNaam) {
//             names.push(object.Spelling[0]);
//             nameLanguages.push(object.Taal[0]);
//           }
//         }

//         if (typeof content.Content.Object[0].OfficieleTalen[0] === 'object') {
//           for (let language of content.Content.Object[0].OfficieleTalen[0].Taal) {
//             officialLanguages.push(language);
//           }
//         }

//         const values = [
//           parseInt(event.id[0]),                                          // event ID
//           Object.keys(content.Content.Event[0])[0],                       // event name
//           content.Content.Object[0].Identificator[0].VersieId[0],         // timestamp,
//           content.Content.Object[0].Id[0],                                // Municipality ID
//           content.Content.Object[0].Identificator[0].Id[0],               // Municipality URI
//           officialLanguages,                                              // OfficialLanguages
//           names,                                                          // Municipality names
//           nameLanguages,                                                  // Language of the municipality names
//           Object.keys(content.Content.Object[0].GemeenteStatus[0])[0] === '$' ? null : content.Content.Object[0].GemeenteStatus[0] // Status of the municipality
//         ];


//         await insertValues(MUNICIPALITY_QUERY, values, 'GemeenteEventHandler');
//       });
//     }
  }
}
