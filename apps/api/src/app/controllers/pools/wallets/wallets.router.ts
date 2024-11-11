import { assertRequestInput } from '@thxnetwork/api/middlewares';
import express from 'express';
import * as RemoveWallets from './delete.controller';
import * as ListWallets from './list.controller';
import * as CreateWallets from './post.controller';

const router: express.Router = express.Router({ mergeParams: true });
router.get('/', assertRequestInput(ListWallets.validation), ListWallets.controller);
router.post('/', assertRequestInput(CreateWallets.validation), CreateWallets.controller);
router.delete('/:walletId', assertRequestInput(RemoveWallets.validation), RemoveWallets.controller);

export default router;
