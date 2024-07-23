import { assertPoolAccess, assertRequestInput } from '@thxnetwork/api/middlewares';
import { upload } from '@thxnetwork/api/util/multer';
import express from 'express';
import * as ListDiscordRoleReward from './list.controller';
import * as ListCouponCodePayments from './payments/list.controller';
import * as CreateDiscordRoleReward from './post.controller';
import * as UpdateDiscordRoleReward from './patch.controller';
import * as RemoveDiscordRoleReward from './delete.controller';

const router: express.Router = express.Router();

router.get(
    '/',
    assertPoolAccess,
    assertRequestInput(ListDiscordRoleReward.validation),
    ListDiscordRoleReward.controller,
);

router.get('/payments', ListCouponCodePayments.controller);

router.patch(
    '/:id',
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(UpdateDiscordRoleReward.validation),
    UpdateDiscordRoleReward.controller,
);
router.post(
    '/',
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(CreateDiscordRoleReward.validation),
    CreateDiscordRoleReward.controller,
);
router.delete(
    '/:id',
    assertPoolAccess,
    assertRequestInput(RemoveDiscordRoleReward.validation),
    RemoveDiscordRoleReward.controller,
);

export default router;
