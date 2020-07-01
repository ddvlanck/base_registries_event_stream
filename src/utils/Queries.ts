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
