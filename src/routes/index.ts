import { Router } from 'express';

import { getAddressContext, getAddressPage, getAddressShape } from '../address-registry/AdresController';
import { getDataCatalogPage } from '../data-catalog/DataCatalogController';
import { getMunicipalityContext, getMunicipalityPage, getMunicipalityShape } from
  '../municipality-registry/GemeenteController';
import { getPostalInfoContext, getPostalInfoPage, getPostalInfoShape } from
  '../postal-information-registry/PostinfoController';
import { getStreetNameContext, getStreetNamePage, getStreetNameShape } from
  '../streetname-registry/StraatnaamController';

const router = Router();

router.get('/', getDataCatalogPage);

router.get('/adres', getAddressPage);
router.get('/adres/shape', getAddressShape);
router.get('/adres/context', getAddressContext);

router.get('/straatnaam', getStreetNamePage);
router.get('/straatnaam/shape', getStreetNameShape);
router.get('/straatnaam/context', getStreetNameContext);

router.get('/postinfo', getPostalInfoPage);
router.get('/postinfo/shape', getPostalInfoShape);
router.get('/postinfo/context', getPostalInfoContext);

router.get('/gemeente', getMunicipalityPage);
router.get('/gemeente/shape', getMunicipalityShape);
router.get('/gemeente/context', getMunicipalityContext);

export default router;
