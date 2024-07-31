import express from 'express';
import * as ListController from './list.controller';
import * as PostController from './post.controller';
import * as PatchController from './patch.controller';
import * as DeleteController from './delete.controller';
import { assertRequestInput, assertModelAccess } from '@thxnetwork/api/middlewares';
import { Client } from '@thxnetwork/api/models';

const router: express.Router = express.Router();

router.get('/', ListController.controller);
router.patch(
    '/:id',
    assertModelAccess(Client),
    assertRequestInput(PatchController.validation),
    PatchController.controller,
);
router.delete(
    '/:id',
    assertModelAccess(Client),
    assertRequestInput(DeleteController.validation),
    DeleteController.controller,
);
router.post('/', assertRequestInput(PostController.validation), PostController.controller);

export default router;
