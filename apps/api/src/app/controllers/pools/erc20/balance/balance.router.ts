import express from 'express';
import { assertRequestInput, assertPoolAccess } from '@thxnetwork/api/middlewares';
import * as ReadBalances from './get.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertPoolAccess, assertRequestInput(ReadBalances.validation), ReadBalances.controller);

export default router;
