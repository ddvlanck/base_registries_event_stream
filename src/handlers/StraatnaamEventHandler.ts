import {STREETNAME_QUERY, insertValues, update} from "../utils/Postgres";

const xml2js = require('xml2js');
const parser = new xml2js.Parser();

export default class StraatnaamEventHandler {

    processPage(data){
        for (let event of data.feed.entry) {
            parser.parseString(event.content, async (err, content) => {
                //TODO: some error with parser saying: 'Error: Non-whitespace before first tag' on event 214 (and others too)
                if(!err) {

                    /*const values = [
                        parseInt(event.id[0]),                                          // event ID
                        Object.keys(content.Content.Event[0])[0],                       // event name
                        content.Content.Object[0].Identificator[0].VersieId[0],         // timestamp,
                        content.Content.Object[0].Id[0],                                // street name ID
                        Object.keys(content.Content.Event[0])[0] === 'StreetNamePersistentLocalIdentifierWasAssigned' ? content.Content.Object[0].Identificator[0].Id[0] : null,    // Street name PURI
                        content.Content.Object[0].Straatnamen[0] ? content.Content.Object[0].Straatnamen[0].GeografischeNaam[0].Spelling[0] : null,    // Geographical name
                        content.Content.Object[0].Straatnamen[0] ? content.Content.Object[0].Straatnamen[0].GeografischeNaam[0].Taal[0]: null,         // Language of name
                        Object.keys(content.Content.Object[0].StraatnaamStatus[0])[0] === '$' ? null: content.Content.Object[0].StraatnaamStatus[0],           // Street name status
                        content.Content.Object[0].NisCode[0],                           // NisCode
                        content.Content.Object[0].IsCompleet[0],                        // Is complete
                    ];*/

                    /*if(!content){
                        console.log("\tEvent: " + event.id[0]);
                        console.log(data);
                    }*/

                    /*await insertValues(STREETNAME_QUERY, values, 'StraatnaamEventHandler');

                    if (Object.keys(content.Content.Event[0])[0] === 'StreetNamePersistentLocalIdentifierWasAssigned') {
                        const updateQuery = 'UPDATE brs."StreetNames" SET "StraatnaamURI" = $1 WHERE "StraatnaamID" = $2';
                        const updateValues = [content.Content.Object[0].Identificator[0].Id[0], content.Content.Object[0].Id[0]];

                        await update(updateQuery, updateValues, 'StraatnaamEventHandler');
                    }*/
                }
            });
        }
    }
}
