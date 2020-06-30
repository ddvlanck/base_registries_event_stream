﻿import express = require("express");
import {getGemeentePage} from "../controllers/GemeenteController";
import { getAddressPage } from "../controllers/AdresController";
import {getStreetNamePage} from "../controllers/StreetNameController";

const router = express.Router();

router.get('/address', getAddressPage);
router.get('/streetnames', getStreetNamePage);
router.get('/municipalities', getGemeentePage);

export default router;
