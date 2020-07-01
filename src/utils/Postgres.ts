const { Client, Pool } = require('pg');

export const POOL = new Pool({
    user: 'postgres',
    host: 'localhost',			// Change IP according to docker container of postgres
    database: 'base_registries',
    password: 'oslo'
});

POOL.on('error', (err, client) => {
    console.error('Error:', err);
});

export function insertValues(query, values, handlerName) {
    POOL.connect((err, client, done) => {
        if (err) throw err;
        client.query(query, values, (err, res) => {
            done();
            if (err) {
                console.log(err.stack);
            }
            console.log('[' + handlerName + ']: inserted event with ID ' + values[0]);
        });
    })
}

export function update(query, values, handlerName) {
    POOL.connect((err, client, done) => {
        if (err) throw err;
        client.query(query, values, (err, res) => {
            done();
            if (err) {
                console.log(err.stack)
            }
            console.log('[' + handlerName + ']: added ' + values[0] + ' as PURI for all records with ID ' + values[1]);
        })
    });
}

export function getRowsForAddressID(addressID: string): Promise<Number> {
    const query = 'SELECT * FROM brs."Addresses" WHERE "AddressID" = $1 ORDER BY "EventID" asc';
    const value = [addressID];
    return new Promise(resolve => {
        POOL.connect((err, client, done) => {
            if (err) throw err;
            client.query(query, value, (err, res) => {
                done();
                if (err) {
                    console.log(err.stack)
                }
                resolve(res.rows.length);
            })
        })
    })
}

export const ADDRESS_QUERY = 'INSERT INTO brs."Addresses"("EventID", "EventName", "Timestamp", "AddressID", "AddressURI", "StreetNameID", "PostalCode", ' +
    '"AddressStatus", ' +
    '"HouseNumber", "FlatNumber", "PositionGeometryMethod", ' +
    '"PositionSpecification", "IsComplete", "OfficiallyAssigned", "AddressPosition") ' +
    'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)';

export const STREETNAME_QUERY = 'INSERT INTO brs."StreetNames" ("EventID", "EventName", "Timestamp", "StreetNameID", "StreetNameURI",' +
    '"GeographicalName", "GeographicalNameLanguage", "Status", "NisCode", "IsComplete") ' +
    'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)';

export const MUNICIPALITY_QUERY = 'INSERT INTO brs."Municipalities" ("EventID", "EventName", "Timestamp", "MunicipalityID", "MunicipalityURI",' +
    '"OfficialLanguage", "GeographicalName", "GeographicalNameLanguage", "Status") ' +
    'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)';




