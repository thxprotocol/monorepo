import express from 'express';
import { assertRequestInput, assertPoolAccess } from '@thxnetwork/api/middlewares';
import * as ListPayments from './list.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertPoolAccess, assertRequestInput(ListPayments.validation), ListPayments.controller);

export default router;
