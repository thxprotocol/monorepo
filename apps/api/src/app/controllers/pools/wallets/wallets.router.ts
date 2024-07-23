import express from 'express';
import { assertRequestInput, assertPoolAccess } from '@thxnetwork/api/middlewares';
import * as ListWallets from './list.controller';
import * as CreateWallets from './post.controller';
import * as RemoveWallets from './delete.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertPoolAccess, assertRequestInput(ListWallets.validation), ListWallets.controller);
router.post('/', assertPoolAccess, assertRequestInput(CreateWallets.validation), CreateWallets.controller);
router.delete('/:walletId', assertPoolAccess, assertRequestInput(RemoveWallets.validation), RemoveWallets.controller);

export default router;
