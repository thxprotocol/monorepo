import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import * as ListEvents from './list.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertRequestInput(ListEvents.validation), ListEvents.controller);

export default router;
