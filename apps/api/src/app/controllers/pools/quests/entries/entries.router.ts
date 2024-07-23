import express from 'express';
import { assertRequestInput, assertPoolAccess } from '@thxnetwork/api/middlewares';
import * as ListController from './list.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertPoolAccess, assertRequestInput(ListController.validation), ListController.controller);

export default router;
