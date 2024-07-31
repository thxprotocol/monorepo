import express from 'express';
import { assertRequestInput, assertPoolAccess } from '@thxnetwork/api/middlewares';
import * as CreateController from './post.controller';
import * as UpdateController from './patch.controller';
import * as RemoveController from './delete.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.post('/', assertPoolAccess, assertRequestInput(CreateController.validation), CreateController.controller);
router.patch('/:uuid', assertRequestInput(UpdateController.validation), UpdateController.controller);
router.delete('/:uuid', assertPoolAccess, assertRequestInput(RemoveController.validation), RemoveController.controller);

export default router;
