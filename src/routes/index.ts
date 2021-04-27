﻿import express from 'express';

import {getMunicipalityPage, getMunicipalityShape} from "../municipality-registry/GemeenteController";
import {getAddressPage, getAddressShape} from '../address-registry/AdresController';
import { getStreetNamePage, getStreetNameShape } from '../streetname-registry/StraatnaamController';
import { getPostalInfoPage, getPostalInfoShape } from '../postal-information-registry/PostinfoController';
import { getBuildingPage } from '../building-registry/GebouwController';

const router = express.Router();

router.get('/adres', getAddressPage);
router.get('/adres/shape', getAddressShape);
router.get('/straatnaam', getStreetNamePage);
router.get('/straatnaam/shape', getStreetNameShape);
router.get('/postinfo', getPostalInfoPage);
router.get('/postinfo/shape', getPostalInfoShape);
router.get('/gemeente', getMunicipalityPage);
router.get('/gemeente/shape', getMunicipalityShape);

export default router;
