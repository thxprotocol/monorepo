import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import ReadWalletCSS from './css/get.controller';
import ReadWalletScript from './js/get.controller';

const router: express.Router = express.Router();

router.get('/css/:id.:ext', assertRequestInput(ReadWalletCSS.validation), ReadWalletCSS.controller);
router.get('/js/:id.:ext', assertRequestInput(ReadWalletScript.validation), ReadWalletScript.controller);

export default router;
