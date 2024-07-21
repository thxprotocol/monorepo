import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import * as ListWallets from './list.controller';
import * as CreateWallets from './post.controller';
import * as RemoveWallets from './delete.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get(
    '/',
    guard.check(['pools:read']),
    assertPoolAccess,
    assertRequestInput(ListWallets.validation),
    ListWallets.controller,
);
router.post(
    '/',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(CreateWallets.validation),
    CreateWallets.controller,
);
router.delete(
    '/:walletId',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(RemoveWallets.validation),
    RemoveWallets.controller,
);

export default router;
