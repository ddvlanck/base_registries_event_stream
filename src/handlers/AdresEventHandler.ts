import xml2js from 'xml2js';

const parser = new xml2js.Parser();

export default class AddressEventHandler {
  async processPage(entries: Array<any>) {
    const self = this;

    for (let event of entries) {
      const position = event.id[0];
      const eventName = event.title[0].replace(`-${position}`, '');

      parser
        .parseStringPromise(event.content[0])
        .then(async function (ev) {
          await self.processEvent(position, eventName, ev);
        })
        .catch(function (err) {
          console.log('Failed to parse event.', err);
        });
    }
  }

  async processEvent(position, eventName, ev) {
    console.log(`Processing ${eventName} at position ${position}.`);
  }


//     for (let event of data.feed.entry) {
//       parser.parseString(event.content, async (err, content) => {
//         if (event.title[0].indexOf('AddressBecameComplete') >= 0) {
//           const values = [
//             parseInt(event.id[0]),                                    // Event ID
//             Object.keys(content.Content.Event[0])[0],       // Event Name
//             content.Content.Object[0].Identificator[0].VersieId[0],      // Timestamp
//             content.Content.Object[0].Id[0],                   // Address ID,
//             Object.keys(content.Content.Event[0])[0] === 'AddressPersistentLocalIdWasAssigned' ? content.Content.Object[0].Identificator[0].Id[0] : null,   // Address PURI,
//             content.Content.Object[0].StraatnaamId[0],      // Straatnaam ID
//             content.Content.Object[0].PostCode[0],      // Postcode
//             content.Content.Object[0].AdresStatus[0],       //Adresstatus,
//             typeof content.Content.Object[0].Huisnummer[0] === 'object' ? null : content.Content.Object[0].Huisnummer[0], // Huisnummer
//             typeof content.Content.Object[0].Busnummer[0] === 'object' ? null : content.Content.Object[0].Busnummer[0],  // Busnummer
//             content.Content.Object[0].PositieGeometrieMethode[0], // PositieGeometrieMethode
//             content.Content.Object[0].PositieSpecificatie[0],   // PositieSpecificatie
//             content.Content.Object[0].IsCompleet[0],    // Is Compleet
//             content.Content.Object[0].OfficieelToegekend[0], // Officieel toegekend
//             this.createPoint(content.Content.Object[0].AdresPositie[0]) //AdresPositie
//           ];

//           const numberOfRows = await getRowsForAddressID(content.Content.Object[0].Id[0]);
//           console.log(Object.keys(content.Content.Event[0])[0] + '(' + event.id[0] + ') --> ' + numberOfRows);

//           if (numberOfRows > 0) {
//             console.log("YES: " + event.id[0]);
//           }

//           await insertValues(ADDRESS_QUERY, values, 'AdresEventHandler');
//         } else {

//         }


//       });
//     }
//   }


//   // ORIGINAL CODE
//   /*processPage(data) {
//       for (let event of data.feed.entry) {
//           parser.parseString(event.content, async (err, content) => {

//               const values = [
//                   parseInt(event.id[0]),                                    // Event ID
//                   Object.keys(content.Content.Event[0])[0],       // Event Name
//                   content.Content.Object[0].Identificator[0].VersieId[0],      // Timestamp
//                   content.Content.Object[0].Id[0],                   // Address ID,
//                   Object.keys(content.Content.Event[0])[0] === 'AddressPersistentLocalIdWasAssigned' ? content.Content.Object[0].Identificator[0].Id[0] : null,   // Address PURI,
//                   content.Content.Object[0].StraatnaamId[0],      // Straatnaam ID
//                   typeof content.Content.Object[0].PostCode[0] === 'object' ? null : content.Content.Object[0].PostCode[0],      // Postcode
//                   content.Content.Object[0].AdresStatus[0],       //Adresstatus,
//                   typeof content.Content.Object[0].Huisnummer[0] === 'object' ? null : content.Content.Object[0].Huisnummer[0], // Huisnummer
//                   typeof content.Content.Object[0].Busnummer[0] === 'object' ? null : content.Content.Object[0].Busnummer[0],  // Busnummer
//                   typeof content.Content.Object[0].PositieGeometrieMethode[0] === 'object' ? null: content.Content.Object[0].PositieGeometrieMethode[0], // PositieGeometrieMethode
//                   typeof content.Content.Object[0].PositieSpecificatie[0] === 'object' ? null : content.Content.Object[0].PositieSpecificatie[0],   // PositieSpecificatie
//                   content.Content.Object[0].IsCompleet[0],    // Is Compleet
//                   content.Content.Object[0].OfficieelToegekend[0], // Officieel toegekend
//                   Object.keys(content.Content.Object[0].AdresPositie[0])[0] !== '$' ? this.createPoint(content.Content.Object[0].AdresPositie[0]) : null //AdresPositie
//               ];

//               await insertValues(ADDRESS_QUERY, values, 'AdresEventHandler');

//               if (Object.keys(content.Content.Event[0])[0] === 'AddressPersistentLocalIdWasAssigned') {
//                   const updateQuery = 'UPDATE brs."Addresses" SET "AddressURI" = $1 WHERE "AddressID" = $2';
//                   const updateValues = [content.Content.Object[0].Identificator[0].Id[0], content.Content.Object[0].Id[0]];
//                   await update(updateQuery, updateValues, 'AdresEventHandler');
//               }

//           });
//       }
//   }*/

//   private createPoint(position) {
//     const [X, Y] = position.point[0].pos[0].split(' ');
//     return '(' + X + ',' + Y + ')';
// }
}
