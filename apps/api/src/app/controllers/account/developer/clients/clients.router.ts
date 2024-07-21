import express from 'express';
import * as ListController from './list.controller';
import * as PostController from './post.controller';
import * as PatchController from './patch.controller';
import * as DeleteController from './delete.controller';
import { assertRequestInput, assertModelAccess, guard } from '@thxnetwork/api/middlewares';
import { Client } from '@thxnetwork/api/models';

const router: express.Router = express.Router();

router.get('/', guard.check(['clients:read']), ListController.controller);
router.patch(
    '/:id',
    guard.check(['clients:read', 'clients:write']),
    assertModelAccess(Client),
    assertRequestInput(PatchController.validation),
    PatchController.controller,
);
router.delete(
    '/:id',
    guard.check(['clients:read', 'clients:write']),
    assertModelAccess(Client),
    assertRequestInput(DeleteController.validation),
    DeleteController.controller,
);
router.post(
    '/',
    guard.check(['clients:read', 'clients:write']),
    assertRequestInput(PostController.validation),
    PostController.controller,
);

export default router;
