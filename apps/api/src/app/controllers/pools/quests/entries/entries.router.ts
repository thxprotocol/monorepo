import express from 'express';
import { assertRequestInput, assertPoolAccess } from '@thxnetwork/api/middlewares';
import * as ListController from './list.controller';
import * as UpdateController from './patch.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertPoolAccess, assertRequestInput(ListController.validation), ListController.controller);
router.patch('/', assertPoolAccess, assertRequestInput(UpdateController.validation), UpdateController.controller);

export default router;
