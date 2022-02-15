import { Router } from 'express';

import { getAddressContext, getAddressFragment, getAddressShape, getAddressVersionObject } from '../address-registry/AdresController';
import { getDataCatalogPage } from '../data-catalog/DataCatalogController';
import { getMunicipalityContext, getMunicipalityFragment, getMunicipalityShape, getMunicipalityVersionObject } from
  '../municipality-registry/GemeenteController';
import { getPostalInfoContext, getPostalInfoFragment, getPostalInformationVersionObject, getPostalInfoShape } from
  '../postal-information-registry/PostinfoController';
import { getStreetNameContext, getStreetNameFragment, getStreetNameShape, getStreetNameVersionObject } from
  '../streetname-registry/StraatnaamController';

const router = Router();

router.get('/', getDataCatalogPage);

router.get('/adres', getAddressFragment);
router.get('/id/adres/:addressId/:versionTimestamp', getAddressVersionObject);
router.get('/adres/shape', getAddressShape);
router.get('/adres/context', getAddressContext);

router.get('/straatnaam', getStreetNameFragment);
router.get('/id/straatnaam/:streetNameId/:versionTimestamp', getStreetNameVersionObject);
router.get('/straatnaam/shape', getStreetNameShape);
router.get('/straatnaam/context', getStreetNameContext);

router.get('/postinfo', getPostalInfoFragment);
router.get('/id/postinfo/:postalInfoId/:versionTimestamp', getPostalInformationVersionObject);
router.get('/postinfo/shape', getPostalInfoShape);
router.get('/postinfo/context', getPostalInfoContext);

router.get('/gemeente', getMunicipalityFragment);
router.get('/id/gemeente/:municipalityId/:versionTimestamp', getMunicipalityVersionObject);
router.get('/gemeente/shape', getMunicipalityShape);
router.get('/gemeente/context', getMunicipalityContext);

export default router;
