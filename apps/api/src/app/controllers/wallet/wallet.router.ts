import { assertRequestInput } from '@thxnetwork/api/middlewares';
import express from 'express';
import ReadWalletCSS from './css/get.controller';
import ReadWallet from './get.controller';
import ReadWalletScript from './js/get.controller';

const router: express.Router = express.Router();

router.get('/:id', assertRequestInput(ReadWallet.validation), ReadWallet.controller);
router.get('/css/:id.:ext', assertRequestInput(ReadWalletCSS.validation), ReadWalletCSS.controller);
router.get('/js/:id.:ext', assertRequestInput(ReadWalletScript.validation), ReadWalletScript.controller);

export default router;
