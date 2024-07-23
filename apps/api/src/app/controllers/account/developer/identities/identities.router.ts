import express from 'express';
import * as CreateController from './post.controller';
import * as ListController from './list.controller';
import * as DeleteController from './delete.controller';
import { assertModelAccess, assertRequestInput } from '@thxnetwork/api/middlewares';
import { Identity } from '@thxnetwork/api/models';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertRequestInput(ListController.validation), ListController.controller);
router.post('/', assertRequestInput(CreateController.validation), CreateController.controller);
router.delete(
    '/:id',
    assertModelAccess(Identity),
    assertRequestInput(DeleteController.validation),
    DeleteController.controller,
);

export default router;
