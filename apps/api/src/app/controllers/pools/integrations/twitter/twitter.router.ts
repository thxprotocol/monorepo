import express from 'express';
import * as CreateController from './queries/post.controller';
import * as UpdateController from './queries/patch.controller';
import * as DeleteController from './queries/delete.controller';
import * as ListController from './queries/list.controller';
import { assertPoolAccess, assertRequestInput } from '@thxnetwork/api/middlewares';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/queries', assertPoolAccess, assertRequestInput(ListController.validation), ListController.controller);
router.post('/queries', assertPoolAccess, assertRequestInput(CreateController.validation), CreateController.controller);
router.patch(
    '/queries/queryId',
    assertPoolAccess,
    assertRequestInput(UpdateController.validation),
    UpdateController.controller,
);
router.delete(
    '/queries/:queryId',
    assertPoolAccess,
    assertRequestInput(DeleteController.validation),
    DeleteController.controller,
);

export default router;
