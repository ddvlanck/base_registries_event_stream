import { Router } from 'express';

import { getAddressContext, getAddressFragment, getAddressShape } from '../address-registry/AdresController';
import { getDataCatalogPage } from '../data-catalog/DataCatalogController';
import { getMunicipalityContext, getMunicipalityFragment, getMunicipalityShape } from
  '../municipality-registry/GemeenteController';
import { getPostalInfoContext, getPostalInfoFragment, getPostalInfoShape } from
  '../postal-information-registry/PostinfoController';
import { getStreetNameContext, getStreetNameFragment, getStreetNameShape } from
  '../streetname-registry/StraatnaamController';

const router = Router();

router.get('/', getDataCatalogPage);

router.get('/adres', getAddressFragment);
router.get('/adres/shape', getAddressShape);
router.get('/adres/context', getAddressContext);

router.get('/straatnaam', getStreetNameFragment);
router.get('/straatnaam/shape', getStreetNameShape);
router.get('/straatnaam/context', getStreetNameContext);

router.get('/postinfo', getPostalInfoFragment);
router.get('/postinfo/shape', getPostalInfoShape);
router.get('/postinfo/context', getPostalInfoContext);

router.get('/gemeente', getMunicipalityFragment);
router.get('/gemeente/shape', getMunicipalityShape);
router.get('/gemeente/context', getMunicipalityContext);

export default router;
