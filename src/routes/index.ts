import { Router } from 'express';

import {
  getAddressContext,
  getAddressFragment, getAddressShape, getAddressVersionObject
} from '../address-registry/AdresController';
import { getDataCatalogContext, getDataCatalogPage } from '../data-catalog/DataCatalogController';
import { getMunicipalityContext, getMunicipalityFragment, getMunicipalityShape, getMunicipalityVersionObject } from
  '../municipality-registry/GemeenteController';
import { getPostalInfoContext, getPostalInfoFragment, getPostalInformationVersionObject, getPostalInfoShape } from
  '../postal-information-registry/PostinfoController';
import { getStreetNameContext, getStreetNameFragment, getStreetNameShape, getStreetNameVersionObject } from
  '../streetname-registry/StraatnaamController';

const router = Router();

router.get('/', getDataCatalogPage);
router.get('/context', getDataCatalogContext);

router.get('/adres/time', getAddressFragment);
router.get('/adres', getAddressFragment);
router.get('/id/adres/time/:addressId/:versionTimestamp', getAddressVersionObject);
router.get('/adres/shape', getAddressShape);
router.get('/adres/context', getAddressContext);

router.get('/straatnaam/time', getStreetNameFragment);
router.get('/straatnaam', getStreetNameFragment);
router.get('/id/straatnaam/time/:streetNameId/:versionTimestamp', getStreetNameVersionObject);
router.get('/straatnaam/shape', getStreetNameShape);
router.get('/straatnaam/context', getStreetNameContext);

router.get('/postinfo/time', getPostalInfoFragment);
router.get('/postinfo', getPostalInfoFragment);
router.get('/id/postinfo/time/:postalInfoId/:versionTimestamp', getPostalInformationVersionObject);
router.get('/postinfo/shape', getPostalInfoShape);
router.get('/postinfo/context', getPostalInfoContext);

router.get('/gemeente/time', getMunicipalityFragment);
router.get('/gemeente', getMunicipalityFragment);
router.get('/id/gemeente/time/:municipalityId/:versionTimestamp', getMunicipalityVersionObject);
router.get('/gemeente/shape', getMunicipalityShape);
router.get('/gemeente/context', getMunicipalityContext);

export default router;
