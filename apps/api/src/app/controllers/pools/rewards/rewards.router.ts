import express from 'express';
import { assertRequestInput, assertPoolAccess } from '@thxnetwork/api/middlewares';
import { upload } from '@thxnetwork/api/util/multer';

import * as ListController from './list.controller';
import * as UpdateController from './patch.controller';
import * as CreateController from './post.controller';
import * as RemoveController from './delete.controller';

import RouterRewardPayments from './payments/payments.router';

const router: express.Router = express.Router({ mergeParams: true });

router.get(
    '/',
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(ListController.validation),
    ListController.controller,
);
router.post(
    '/:variant',
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);
router.patch(
    '/:variant/:rewardId',
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(UpdateController.validation),
    UpdateController.controller,
);
router.delete(
    '/:variant/:rewardId',
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(RemoveController.validation),
    RemoveController.controller,
);

router.use('/:variant/:rewardId/payments', RouterRewardPayments);

export default router;
