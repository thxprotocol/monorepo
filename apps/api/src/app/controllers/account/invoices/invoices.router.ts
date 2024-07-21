import express from 'express';
import * as ListInvoices from './list.controller';
import { assertRequestInput } from '@thxnetwork/api/middlewares';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertRequestInput(ListInvoices.validation), ListInvoices.controller);

export default router;
