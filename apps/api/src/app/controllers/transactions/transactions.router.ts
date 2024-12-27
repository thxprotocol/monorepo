import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import ListController from './list.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/:walletId', assertRequestInput(ListController.validation), ListController.controller);

export default router;
