import express from 'express';
import { assertRequestInput, assertPoolAccess } from '@thxnetwork/api/middlewares';
import { upload } from '@thxnetwork/api/util/multer';

import * as ListController from './list.controller';
import * as CreateListController from './post.controller';
import * as CreateController from './variant/post.controller';
import * as UpdateController from './variant/patch.controller';
import * as RemoveController from './variant/delete.controller';

import RouterQuestEntries from './variant/entries/entries.router';

const router: express.Router = express.Router({ mergeParams: true });

router.get(
    '/',
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(ListController.validation),
    ListController.controller,
);
router.post(
    '/',
    assertPoolAccess,
    assertRequestInput(CreateListController.validation),
    CreateListController.controller,
);
router.post(
    '/:variant',
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);
router.patch(
    '/:variant/:questId',
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(UpdateController.validation),
    UpdateController.controller,
);
router.delete(
    '/:variant/:questId',
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(RemoveController.validation),
    RemoveController.controller,
);

router.use('/:variant/:questId/entries', RouterQuestEntries);

export default router;
