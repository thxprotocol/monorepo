import express from 'express';
import { assertRequestInput, assertPoolAccess } from '@thxnetwork/api/middlewares';
import * as CreateController from './post.controller';
import * as UpdateController from './patch.controller';
import * as RemoveController from './delete.controller';
import * as ListController from './list.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertPoolAccess, assertRequestInput(ListController.validation), ListController.controller);
router.post('/', assertPoolAccess, assertRequestInput(CreateController.validation), CreateController.controller);
router.patch(
    '/:guildId',
    assertPoolAccess,
    assertRequestInput(UpdateController.validation),
    UpdateController.controller,
);
router.delete(
    '/:guildId',
    assertPoolAccess,
    assertRequestInput(RemoveController.validation),
    RemoveController.controller,
);

export default router;
