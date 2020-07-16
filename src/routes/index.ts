﻿import express from 'express';

import { getGemeentePage } from '../controllers/GemeenteController';
import { getAddressPage, getAddress } from '../controllers/AdresController';
import { getStreetNamePage } from '../controllers/StraatnaamController';
import { getPostalInfoPage } from '../controllers/PostinfoController';
import { getBuildingPage } from '../controllers/GebouwController';

const router = express.Router();

router.get('/address', getAddressPage);
router.get('/address/:objectId', getAddress);

router.get('/streetname', getStreetNamePage);
router.get('/postalInfo', getPostalInfoPage);
router.get('/municipality', getGemeentePage);
router.get('/building', getBuildingPage);

export default router;
