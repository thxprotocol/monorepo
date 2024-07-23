import express from 'express';
import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';

import * as GetBrand from './get.controller';
import * as PutBrand from './put.controller';

const router: express.Router = express.Router();
router.get('/', GetBrand.controller);
router.use(checkJwt).use(corsHandler).put('/', assertRequestInput(PutBrand.validation), PutBrand.controller);

export default router;
