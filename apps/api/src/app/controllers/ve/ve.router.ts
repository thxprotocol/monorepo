import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import { assertWallet } from '@thxnetwork/api/middlewares/assertWallet';

import * as ListController from './list.controller';

const router: express.Router = express.Router();

router.use('/', assertWallet);
router.get('/', assertRequestInput(ListController.validation), ListController.controller);

export default router;
