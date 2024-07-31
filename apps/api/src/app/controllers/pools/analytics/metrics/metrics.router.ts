import express from 'express';
import { assertRequestInput, assertPoolAccess } from '@thxnetwork/api/middlewares';
import * as ListMetrics from './list.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertPoolAccess, assertRequestInput(ListMetrics.validation), ListMetrics.controller);

export default router;
